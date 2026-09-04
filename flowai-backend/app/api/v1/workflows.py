from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.models.workflow_step import WorkflowStep
from app.models.job import Job
from app.config import settings
from app.queue.idempotency import build_idempotency_key
from app.queue.tasks.workflow_tasks import execute_workflow_task
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowDetailRead,
    WorkflowPublishRequest,
    WorkflowRead,
    WorkflowRollbackRequest,
    WorkflowRunCreate,
    WorkflowRunRead,
    WorkflowUpdate,
)
from app.workflow_engine.engine import workflow_engine
from app.workflow_engine.versioning import workflow_versioning

router = APIRouter(prefix="/workflows", tags=["workflows"])


def owned_workflow(workflow_id: int, user: User, db: Session) -> Workflow:
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id, Workflow.user_id == user.id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.get("", response_model=list[WorkflowRead])
def list_workflows(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> list[Workflow]:
    return db.query(Workflow).filter(Workflow.user_id == user.id).order_by(Workflow.updated_at.desc()).all()


@router.post("", response_model=WorkflowRead, status_code=status.HTTP_201_CREATED)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> Workflow:
    try:
        workflow_engine.validate(payload.definition.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    workflow = Workflow(
        user_id=user.id,
        name=payload.name,
        description=payload.description,
        definition=payload.definition.model_dump(),
        status=payload.status,
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.get("/{workflow_id}", response_model=WorkflowDetailRead)
def get_workflow(workflow_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> Workflow:
    workflow = owned_workflow(workflow_id, user, db)
    workflow.runs = db.query(WorkflowRun).filter(WorkflowRun.workflow_id == workflow.id).order_by(WorkflowRun.created_at.desc()).all()
    for run in workflow.runs:
        run.steps = db.query(WorkflowStep).filter(WorkflowStep.run_id == run.id).order_by(WorkflowStep.created_at).all()
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowRead)
def update_workflow(workflow_id: int, payload: WorkflowUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> Workflow:
    workflow = owned_workflow(workflow_id, user, db)
    values = payload.model_dump(exclude_unset=True)
    if "definition" in values and values["definition"] is not None:
        try:
            workflow_engine.validate(values["definition"])
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
    for field, value in values.items():
        setattr(workflow, field, value)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.post("/{workflow_id}/publish", response_model=WorkflowRead)
def publish_workflow(
    workflow_id: int,
    payload: WorkflowPublishRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Workflow:
    workflow = owned_workflow(workflow_id, user, db)
    return workflow_versioning.publish_version(workflow, comment=payload.comment, db=db)


@router.post("/{workflow_id}/rollback", response_model=WorkflowRead)
def rollback_workflow(
    workflow_id: int,
    payload: WorkflowRollbackRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Workflow:
    workflow = owned_workflow(workflow_id, user, db)
    return workflow_versioning.rollback_version(workflow, target_version=payload.target_version, db=db)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(workflow_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> None:
    workflow = owned_workflow(workflow_id, user, db)
    db.delete(workflow)
    db.commit()


@router.post("/{workflow_id}/runs", response_model=WorkflowRunRead, status_code=status.HTTP_201_CREATED)
async def run_workflow(workflow_id: int, payload: WorkflowRunCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> WorkflowRun:
    workflow = owned_workflow(workflow_id, user, db)
    idempotency_key = build_idempotency_key("workflow", user.id, {"workflow_id": workflow.id, "input_data": payload.input_data})
    existing_job = db.query(Job).filter(Job.idempotency_key == idempotency_key).first()
    if existing_job:
        existing_run = db.query(WorkflowRun).filter(WorkflowRun.id == existing_job.payload.get("run_id")).first()
        if existing_run:
            return existing_run
    run = WorkflowRun(workflow_id=workflow.id, user_id=user.id, input_data=payload.input_data, status="queued")
    db.add(run)
    db.commit()
    db.refresh(run)
    job = Job(user_id=user.id, job_type="workflow", idempotency_key=idempotency_key, payload={"workflow_id": workflow.id, "run_id": run.id, "input_data": payload.input_data}, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)
    try:
        if settings.QUEUE_ENABLED:
            task_result = execute_workflow_task.apply_async(args=[job.id, workflow.id, run.id])
            job.task_id = task_result.id
            db.commit()
            return run
    except (ConnectionError, OSError, SQLAlchemyError):
        pass
    result = await workflow_engine.run(workflow, run, db)
    job.status = "succeeded" if result.status in {"succeeded", "awaiting_approval"} else "failed"
    job.result = {"workflow_run_id": result.id, "status": result.status}
    job.completed_at = datetime.now(timezone.utc)
    db.commit()
    return result


@router.get("/{workflow_id}/runs/{run_id}", response_model=WorkflowRunRead)
def get_workflow_run(workflow_id: int, run_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> WorkflowRun:
    owned_workflow(workflow_id, user, db)
    run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id, WorkflowRun.workflow_id == workflow_id, WorkflowRun.user_id == user.id).first()
    if run is None:
        raise HTTPException(status_code=404, detail="Workflow run not found")
    run.steps = db.query(WorkflowStep).filter(WorkflowStep.run_id == run.id).order_by(WorkflowStep.created_at).all()
    return run