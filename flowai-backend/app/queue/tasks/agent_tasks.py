import asyncio
from datetime import datetime, timezone

from app.agents.executor import AgentExecutor
from app.db.session import SessionLocal
from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.job import Job
from app.queue.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, name="flowai.agent.execute")
def execute_agent_task(self, job_id: int, run_id: int, agent_id: int | None = None, use_multi_agent: bool = False) -> dict:
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    try:
        if not job or not run:
            raise ValueError("Agent job resources not found")
        agent = db.query(Agent).filter(Agent.id == agent_id).first() if agent_id else None
        allowed_tools = set(agent.allowed_tools) if agent and agent.allowed_tools else None
        job.status = "running"
        job.attempts += 1
        job.started_at = datetime.now(timezone.utc)
        run.status = "running"
        run.started_at = datetime.now(timezone.utc)
        db.commit()

        # Multi-agent coordination
        is_multi = use_multi_agent or (agent is None and ("compare" in run.objective.lower() or "research" in run.objective.lower()))
        result = asyncio.run(
            AgentExecutor().execute(
                run.objective,
                user_id=run.user_id,
                db=db,
                allowed_tools=allowed_tools,
                use_multi_agent_supervisor=is_multi,
            )
        )
        run.plan = result["plan"]
        run.steps = result["steps"]
        run.result = result["result"]
        run.status = "succeeded"
        run.completed_at = datetime.now(timezone.utc)
        job.status = "succeeded"
        job.result = {"agent_run_id": run.id, "status": run.status}
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
        return job.result
    except Exception as exc:
        if run:
            run.status = "failed"
            run.error = str(exc)
            run.completed_at = datetime.now(timezone.utc)
        if job:
            job.status = "failed"
            job.error = str(exc)
            job.completed_at = datetime.now(timezone.utc)
        db.commit()
        raise
    finally:
        db.close()