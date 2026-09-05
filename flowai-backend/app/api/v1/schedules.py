from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.schedule import Schedule
from app.models.user import User
from app.models.workflow import Workflow
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate
from app.workflow_engine.scheduler import compute_next_run

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.get("", response_model=list[ScheduleRead])
def list_schedules(
    workflow_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> list[Schedule]:
    query = db.query(Schedule).filter(Schedule.user_id == user.id)
    if workflow_id:
        query = query.filter(Schedule.workflow_id == workflow_id)
    return query.order_by(Schedule.created_at.desc()).all()


@router.post("", response_model=ScheduleRead, status_code=status.HTTP_201_CREATED)
def create_schedule(
    payload: ScheduleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Schedule:
    workflow = (
        db.query(Workflow)
        .filter(Workflow.id == payload.workflow_id, Workflow.user_id == user.id)
        .first()
    )
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    next_run = compute_next_run(payload.cron_expression)
    schedule = Schedule(
        user_id=user.id,
        workflow_id=payload.workflow_id,
        name=payload.name or f"{workflow.name} schedule",
        description=payload.description,
        cron_expression=payload.cron_expression,
        timezone=payload.timezone,
        is_active=payload.is_active,
        next_run_at=next_run,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/{schedule_id}", response_model=ScheduleRead)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Schedule:
    schedule = (
        db.query(Schedule)
        .filter(Schedule.id == schedule_id, Schedule.user_id == user.id)
        .first()
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@router.put("/{schedule_id}", response_model=ScheduleRead)
def update_schedule(
    schedule_id: int,
    payload: ScheduleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Schedule:
    schedule = (
        db.query(Schedule)
        .filter(Schedule.id == schedule_id, Schedule.user_id == user.id)
        .first()
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(schedule, field, value)

    if "cron_expression" in data:
        schedule.next_run_at = compute_next_run(schedule.cron_expression)

    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> None:
    schedule = (
        db.query(Schedule)
        .filter(Schedule.id == schedule_id, Schedule.user_id == user.id)
        .first()
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
