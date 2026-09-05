from app.integrations.email.smtp_provider import smtp_email_provider
from app.queue.celery_app import celery_app
from app.queue.idempotency import build_idempotency_key

_sent: set[str] = set()


@celery_app.task(name="flowai.email.send")
def send_email_task(to: str, subject: str, body: str, idempotency_key: str | None = None) -> dict:
    key = idempotency_key or build_idempotency_key("email", 0, {"to": to, "subject": subject, "body": body})
    if key in _sent:
        return {"status": "duplicate", "idempotency_key": key}
    result = smtp_email_provider.send(to, subject, body)
    _sent.add(key)
    return {**result, "idempotency_key": key}
