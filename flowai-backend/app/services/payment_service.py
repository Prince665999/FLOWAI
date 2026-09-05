from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.events.event_bus import event_bus
from app.events.event_types import PAYMENT_FAILED, PAYMENT_SUCCEEDED
from app.integrations.payments.provider import PaymentProvider
from app.integrations.payments.stripe_provider import StripePaymentProvider
from app.integrations.payments.test_provider import TestPaymentProvider
from app.models.order import Order
from app.models.payment import Payment


def get_payment_provider() -> PaymentProvider:
    if settings.PAYMENT_PROVIDER == "stripe" and settings.STRIPE_SECRET_KEY:
        return StripePaymentProvider()
    return TestPaymentProvider()


class PaymentService:
    def create_intent(self, db: Session, order: Order, idempotency_key: str) -> Payment:
        existing = db.query(Payment).filter_by(idempotency_key=idempotency_key).first()
        if existing:
            if existing.order_id != order.id:
                raise HTTPException(409, "Idempotency key already used")
            return existing
        provider = get_payment_provider()
        intent = provider.create_intent(amount=order.total_amount, currency=order.currency, idempotency_key=idempotency_key)
        payment = Payment(
            order_id=order.id,
            provider=settings.PAYMENT_PROVIDER,
            provider_payment_id=str(intent.get("id")),
            amount=order.total_amount,
            currency=order.currency,
            status=str(intent.get("status", "pending")),
            idempotency_key=idempotency_key,
            provider_metadata=intent,
        )
        db.add(payment)
        if payment.status == "succeeded":
            self.mark_paid(db, order, payment)
        else:
            db.commit()
            db.refresh(payment)
        return payment

    def mark_paid(self, db: Session, order: Order, payment: Payment) -> Payment:
        payment.status = "succeeded"
        order.payment_status = "paid"
        if order.status in {"pending", "awaiting_payment"}:
            order.status = "confirmed"
        event_bus.publish(
            db,
            event_type=PAYMENT_SUCCEEDED,
            aggregate_type="payment",
            aggregate_id=str(payment.id),
            idempotency_key=f"payment-succeeded:{payment.id}",
            payload={"order_id": order.id, "payment_id": payment.id},
        )
        db.commit()
        db.refresh(payment)
        return payment

    def mark_failed(self, db: Session, order: Order, payment: Payment, reason: str | None = None) -> Payment:
        payment.status = "failed"
        order.payment_status = "failed"
        event_bus.publish(
            db,
            event_type=PAYMENT_FAILED,
            aggregate_type="payment",
            aggregate_id=str(payment.id),
            idempotency_key=f"payment-failed:{payment.id}",
            payload={"order_id": order.id, "reason": reason},
        )
        db.commit()
        db.refresh(payment)
        return payment

    def refund(self, db: Session, payment: Payment, amount: int | None = None) -> Payment:
        provider = get_payment_provider()
        result = provider.refund(payment.provider_payment_id or "", amount)
        payment.status = str(result.get("status", "refunded"))
        payment.provider_metadata = {**(payment.provider_metadata or {}), "refund": result}
        order = db.query(Order).filter_by(id=payment.order_id).first()
        if order:
            order.payment_status = "refunded"
            order.status = "cancelled"
        db.commit()
        db.refresh(payment)
        return payment


payment_service = PaymentService()
