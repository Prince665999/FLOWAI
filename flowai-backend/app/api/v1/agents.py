from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.tool_call import ToolCall
from app.models.agent import Agent
from app.models.agent_run import AgentRun
from app.models.job import Job
from app.models.user import User
from app.queue.idempotency import build_idempotency_key
from app.queue.tasks.agent_tasks import execute_agent_task
from app.agents.executor import AgentExecutor
from app.schemas.agent import AgentCreate, AgentRead, AgentRunCreate, AgentRunRead
from app.schemas.tool import ToolCallRead, ToolDefinition, ToolInvokeRequest
from app.tools.base_tool import ToolContext
from app.tools.registry import ToolNotFoundError, tool_registry

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentRead])
def list_agents(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> list[Agent]:
    return db.query(Agent).filter(Agent.user_id == user.id, Agent.is_active.is_(True)).order_by(Agent.created_at.desc()).all()


@router.post("", response_model=AgentRead)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> Agent:
    agent = Agent(user_id=user.id, name=payload.name, description=payload.description, allowed_tools=payload.allowed_tools)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.get("/runs", response_model=list[AgentRunRead])
def list_agent_runs(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> list[AgentRun]:
    return db.query(AgentRun).filter(AgentRun.user_id == user.id).order_by(AgentRun.created_at.desc()).limit(100).all()


@router.post("/runs", response_model=AgentRunRead, status_code=201)
async def start_agent_run(payload: AgentRunCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> AgentRun:
    agent = None
    if payload.agent_id is not None:
        agent = db.query(Agent).filter(Agent.id == payload.agent_id, Agent.user_id == user.id, Agent.is_active.is_(True)).first()
        if agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
    key_payload = {"objective": payload.objective, "agent_id": payload.agent_id}
    idempotency_key = build_idempotency_key("agent", user.id, key_payload)
    existing_job = db.query(Job).filter(Job.idempotency_key == idempotency_key).first()
    if existing_job:
        existing_run = db.query(AgentRun).filter(AgentRun.id == existing_job.payload.get("run_id")).first()
        if existing_run:
            return existing_run
    run = AgentRun(agent_id=payload.agent_id, user_id=user.id, objective=payload.objective, status="queued")
    db.add(run)
    db.commit()
    db.refresh(run)
    job = Job(user_id=user.id, job_type="agent", idempotency_key=idempotency_key, payload={"run_id": run.id, "agent_id": payload.agent_id}, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)
    try:
        task = execute_agent_task.apply_async(args=[job.id, run.id, payload.agent_id])
        job.task_id = task.id
        db.commit()
    except Exception:
        result = await AgentExecutor().execute(payload.objective, user_id=user.id, db=db, allowed_tools=set(agent.allowed_tools) if agent and agent.allowed_tools else None)
        run.plan, run.steps, run.result, run.status = result["plan"], result["steps"], result["result"], "succeeded"
        run.completed_at = datetime.now(timezone.utc)
        job.status, job.result = "succeeded", {"agent_run_id": run.id, "status": run.status}
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
    return run


@router.get("/runs/{run_id}", response_model=AgentRunRead)
def get_agent_run(run_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> AgentRun:
    run = db.query(AgentRun).filter(AgentRun.id == run_id, AgentRun.user_id == user.id).first()
    if run is None:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return run


@router.get("/tools", response_model=list[ToolDefinition])
def list_tools(user: User = Depends(get_current_active_user)) -> list[dict]:
    return tool_registry.list_definitions()


@router.post("/tools/{tool_name}", response_model=ToolCallRead)
async def invoke_tool(
    tool_name: str,
    payload: ToolInvokeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> ToolCall:
    try:
        tool = tool_registry.get(tool_name)
    except ToolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {tool_name}") from exc

    call = ToolCall(user_id=user.id, tool_name=tool.name, arguments=payload.arguments, status="running")
    db.add(call)
    db.commit()
    db.refresh(call)
    try:
        call.result = await tool.execute(payload.arguments, ToolContext(user_id=user.id, db=db))
        call.status = "succeeded"
    except Exception as exc:
        call.status = "failed"
        call.error = str(exc)
    call.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(call)
    return call


@router.get("/tool-calls", response_model=list[ToolCallRead])
def list_tool_calls(
    db: Session = Depends(get_db), user: User = Depends(get_current_active_user)
) -> list[ToolCall]:
    return db.query(ToolCall).filter(ToolCall.user_id == user.id).order_by(ToolCall.created_at.desc()).limit(100).all()
