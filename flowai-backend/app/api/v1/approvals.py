from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.approval import Approval
from app.models.user import User
from app.schemas.approval import ApprovalActionRequest, ApprovalCreate, ApprovalRead
from app.services.approval_service import approval_service

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("", response_model=list[ApprovalRead])
def list_approvals(
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> list[Approval]:
    return approval_service.get_approvals(db, user, status=status_filter)


@router.get("/pending", response_model=list[ApprovalRead])
def list_pending_approvals(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> list[Approval]:
    return approval_service.get_approvals(db, user, status="pending")


@router.get("/{approval_id}", response_model=ApprovalRead)
def get_approval(
    approval_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Approval:
    return approval_service.get_approval_by_id(db, user, approval_id)


@router.post("", response_model=ApprovalRead, status_code=status.HTTP_201_CREATED)
def create_approval(
    payload: ApprovalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Approval:
    approval = Approval(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        action_type=payload.action_type,
        payload=payload.payload,
        workflow_run_id=payload.workflow_run_id,
        agent_run_id=payload.agent_run_id,
        step_id=payload.step_id,
        status="pending",
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


@router.post("/{approval_id}/action", response_model=ApprovalRead)
async def perform_approval_action(
    approval_id: int,
    request: ApprovalActionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Approval:
    return await approval_service.process_approval_action(
        db=db,
        user=user,
        approval_id=approval_id,
        action=request.action,
        new_payload=request.payload,
        comment=request.comment,
    )


@router.post("/{approval_id}/approve", response_model=ApprovalRead)
async def approve_request(
    approval_id: int,
    comment: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Approval:
    return await approval_service.process_approval_action(
        db=db,
        user=user,
        approval_id=approval_id,
        action="approve",
        comment=comment,
    )


@router.post("/{approval_id}/reject", response_model=ApprovalRead)
async def reject_request(
    approval_id: int,
    comment: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Approval:
    return await approval_service.process_approval_action(
        db=db,
        user=user,
        approval_id=approval_id,
        action="reject",
        comment=comment,
    )
