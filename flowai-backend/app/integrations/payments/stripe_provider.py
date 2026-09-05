from app.config import settings
from app.integrations.payments.test_provider import TestPaymentProvider

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None


class StripePaymentProvider(TestPaymentProvider):
    """Uses Stripe when STRIPE_SECRET_KEY is set; otherwise stays in test mode."""

    def create_intent(self, *, amount: int, currency: str, idempotency_key: str) -> dict:
        if not settings.STRIPE_SECRET_KEY or stripe is None:
            return super().create_intent(amount=amount, currency=currency, idempotency_key=idempotency_key)
        stripe.api_key = settings.STRIPE_SECRET_KEY
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency.lower(),
            idempotency_key=idempotency_key,
            automatic_payment_methods={"enabled": True},
        )
        return {"id": intent.id, "status": intent.status, "amount": amount, "currency": currency, "client_secret": intent.client_secret}

    def verify_webhook(self, payload: bytes, signature: str | None) -> dict:
        if not settings.STRIPE_WEBHOOK_SECRET or stripe is None:
            return super().verify_webhook(payload, signature)
        event = stripe.Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)
        return {"verified": True, "type": event["type"], "data": event["data"]["object"]}

    def refund(self, provider_payment_id: str, amount: int | None = None) -> dict:
        if not settings.STRIPE_SECRET_KEY or stripe is None:
            return super().refund(provider_payment_id, amount)
        stripe.api_key = settings.STRIPE_SECRET_KEY
        kwargs = {"payment_intent": provider_payment_id}
        if amount is not None:
            kwargs["amount"] = amount
        refund = stripe.Refund.create(**kwargs)
        return {"id": refund.id, "status": refund.status, "amount": refund.amount}
