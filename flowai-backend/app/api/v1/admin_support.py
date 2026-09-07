from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_employee_or_manager_or_admin
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.support_ticket import SupportTicket
from app.models.user import User
from app.schemas.support_ticket import SupportTicketRead, SupportTicketUpdate

router = APIRouter(prefix="/admin/support/tickets", tags=["admin-support"])


@router.get("", response_model=list[SupportTicketRead])
def list_support_tickets(
    db: Session = Depends(get_db), user: User = Depends(get_current_active_user)
) -> list[SupportTicket]:
    require_employee_or_manager_or_admin(user)
    return db.query(SupportTicket).order_by(SupportTicket.updated_at.desc()).all()


@router.get("/{ticket_id}", response_model=SupportTicketRead)
def get_support_ticket(
    ticket_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)
) -> SupportTicket:
    require_employee_or_manager_or_admin(user)
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=SupportTicketRead)
def update_support_ticket(
    ticket_id: int,
    payload: SupportTicketUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> SupportTicket:
    require_employee_or_manager_or_admin(user)
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    db.commit()
    db.refresh(ticket)
    return ticket
