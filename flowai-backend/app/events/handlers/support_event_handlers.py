from sqlalchemy.orm import Session

from app.events.event_bus import event_bus
from app.events.event_types import SUPPORT_TICKET_CREATED
from app.models.domain_event import DomainEvent
from app.models.user import User
from app.services.notification_service import notification_service


def on_support_ticket_created(db: Session, event: DomainEvent) -> None:
    ticket_id = (event.payload or {}).get("ticket_id")
    subject = (event.payload or {}).get("subject", "New support ticket")
    staff = db.query(User).filter(User.account_type == "staff", User.role_name.in_(["employee", "manager", "admin"])).all()
    for user in staff:
        notification_service.create(
            db,
            user.id,
            {"title": "Support ticket", "body": f"#{ticket_id}: {subject}", "channel": "in_app", "metadata": event.payload or {}},
        )


event_bus.subscribe(SUPPORT_TICKET_CREATED, on_support_ticket_created)
