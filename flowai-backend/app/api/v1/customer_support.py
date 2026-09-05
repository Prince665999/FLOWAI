from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import require_customer_dep
from app.models.support_ticket import SupportTicket
from app.models.user import User
from app.schemas.support_ticket import SupportTicketCreate,SupportTicketRead
from app.services.support_service import support_service
router=APIRouter(prefix="/customer/support/tickets",tags=["customer-support"])
@router.get("",response_model=list[SupportTicketRead])
def list_tickets(db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):return db.query(SupportTicket).filter_by(user_id=user.id).order_by(SupportTicket.created_at.desc()).all()
@router.post("",response_model=SupportTicketRead,status_code=201)
def create_ticket(payload:SupportTicketCreate,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):return support_service.create(db,user.id,payload)
@router.get("/{ticket_id}",response_model=SupportTicketRead)
def ticket(ticket_id:int,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):return support_service.owned(db,ticket_id,user.id)
