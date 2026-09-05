from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.order import Order
from app.models.support_ticket import SupportTicket
from app.schemas.support_ticket import SupportTicketCreate, SupportTicketUpdate

class SupportService:
    def create(self,db:Session,user_id:int,payload:SupportTicketCreate)->SupportTicket:
        if payload.order_id and not db.query(Order).filter_by(id=payload.order_id,user_id=user_id).first(): raise HTTPException(404,"Order not found")
        customer=db.query(Customer).filter_by(user_id=user_id).first()
        ticket=SupportTicket(user_id=user_id,customer_id=customer.id if customer else None,**payload.model_dump())
        db.add(ticket);db.commit();db.refresh(ticket);return ticket
    def owned(self,db:Session,ticket_id:int,user_id:int)->SupportTicket:
        ticket=db.query(SupportTicket).filter_by(id=ticket_id,user_id=user_id).first()
        if not ticket:raise HTTPException(404,"Support ticket not found")
        return ticket
    def update(self,db:Session,ticket:SupportTicket,payload:SupportTicketUpdate)->SupportTicket:
        for key,value in payload.model_dump(exclude_unset=True).items():setattr(ticket,key,value)
        db.commit();db.refresh(ticket);return ticket
support_service=SupportService()
