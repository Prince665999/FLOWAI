from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import require_customer_dep
from app.models.order import Order
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentIntentRequest, PaymentRead
router=APIRouter(prefix="/store/payments",tags=["store-payments"])
@router.post("/create-intent",response_model=PaymentRead,status_code=201)
def create_intent(payload:PaymentIntentRequest,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):
    order=db.query(Order).filter_by(id=payload.order_id,user_id=user.id).first()
    if not order: raise HTTPException(404,"Order not found")
    payment=db.query(Payment).filter_by(idempotency_key=payload.idempotency_key).first()
    if payment and payment.order_id != order.id: raise HTTPException(409,"Idempotency key already used")
    if not payment:
        payment=Payment(order_id=order.id,provider="test",provider_payment_id=f"test_{payload.idempotency_key}",amount=order.total_amount,currency=order.currency,status="succeeded",idempotency_key=payload.idempotency_key)
        db.add(payment); order.payment_status="paid"; order.status="confirmed"; db.commit(); db.refresh(payment)
    return payment
