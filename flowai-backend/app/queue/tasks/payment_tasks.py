from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.order import Order
from app.models.payment import Payment
from app.queue.celery_app import celery_app
from app.services.payment_service import payment_service


def process_payment_event_sync(db: Session, provider_payment_id: str, status: str) -> dict:
    payment = db.query(Payment).filter_by(provider_payment_id=provider_payment_id).first()
    if payment is None:
        return {"status": "ignored"}
    order = db.query(Order).filter_by(id=payment.order_id).first()
    if order is None:
        return {"status": "missing_order"}
    if status == "succeeded":
        payment_service.mark_paid(db, order, payment)
    elif status in {"failed", "canceled"}:
        payment_service.mark_failed(db, order, payment, reason=status)
    return {"payment_id": payment.id, "status": payment.status}


@celery_app.task(name="flowai.payments.webhook")
def process_payment_event(provider_payment_id: str, status: str) -> dict:
    db = SessionLocal()
    try:
        return process_payment_event_sync(db, provider_payment_id, status)
    finally:
        db.close()
