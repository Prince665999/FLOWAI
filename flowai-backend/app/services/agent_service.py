from typing import Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.agents.executor import AgentExecutor
from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.user import User
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service


class AgentService:
    def list_agents(self, db: Session, user: User) -> list[Agent]:
        return (
            db.query(Agent)
            .filter(Agent.user_id == user.id, Agent.is_active.is_(True))
            .order_by(Agent.created_at.desc())
            .all()
        )

    def get_agent(self, db: Session, user: User, agent_id: int) -> Agent:
        agent = (
            db.query(Agent)
            .filter(Agent.id == agent_id, Agent.user_id == user.id, Agent.is_active.is_(True))
            .first()
        )
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return agent

    def create_agent(
        self,
        db: Session,
        user: User,
        name: str,
        description: str | None = None,
        allowed_tools: list[str] | None = None,
    ) -> Agent:
        agent = Agent(
            user_id=user.id,
            name=name,
            description=description,
            allowed_tools=allowed_tools or [],
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)

        audit_service.log_event(
            db=db,
            action="agent.create",
            resource_type="agent",
            resource_id=agent.id,
            user_id=user.id,
            actor_type="user",
            details={"name": name, "allowed_tools": allowed_tools},
        )
        return agent

    async def execute_agent_run(
        self,
        db: Session,
        run: AgentRun,
        agent: Agent | None = None,
        use_multi_agent: bool = False,
    ) -> AgentRun:
        allowed_tools = set(agent.allowed_tools) if agent and agent.allowed_tools else None
        executor = AgentExecutor()
        result = await executor.execute(
            objective=run.objective,
            user_id=run.user_id,
            db=db,
            allowed_tools=allowed_tools,
            use_multi_agent_supervisor=use_multi_agent,
        )

        run.plan = result["plan"]
        run.steps = result["steps"]
        run.result = result["result"]
        run.status = "succeeded"
        db.commit()
        db.refresh(run)

        audit_service.log_event(
            db=db,
            action="agent.run.succeeded",
            resource_type="agent_run",
            resource_id=run.id,
            user_id=run.user_id,
            actor_type="agent",
            details={"steps_count": len(run.steps), "objective": run.objective},
        )

        notification_service.create(
            db=db,
            user_id=run.user_id,
            data={
                "title": "Agent Execution Succeeded",
                "body": f"Objective '{run.objective[:60]}...' completed in {len(run.steps)} steps.",
                "channel": "agent",
            },
        )
        return run


agent_service = AgentService()
