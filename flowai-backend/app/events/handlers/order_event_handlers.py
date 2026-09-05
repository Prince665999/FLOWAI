from sqlalchemy.orm import Session

from app.events.event_bus import event_bus
from app.events.event_types import ORDER_CREATED, ORDER_SHIPPED, PAYMENT_SUCCEEDED
from app.models.domain_event import DomainEvent
from app.models.order import Order
from app.models.user import User
from app.services.notification_service import notification_service


def on_order_created(db: Session, event: DomainEvent) -> None:
    order_id = (event.payload or {}).get("order_id")
    user_id = (event.payload or {}).get("user_id")
    if not order_id or not user_id:
        return
    order = db.query(Order).filter_by(id=order_id).first()
    if order is None:
        return
    notification_service.create(
        db,
        user_id,
        {
            "title": "Order received",
            "body": f"Order {order.order_number} was created and is being processed.",
            "channel": "in_app",
            "metadata": {"order_id": order.id},
        },
    )
    try:
        from app.queue.tasks.commerce_tasks import process_order_created

        process_order_created.delay(order.id, user_id)
    except Exception:
        from app.queue.tasks.commerce_tasks import process_order_created_sync

        process_order_created_sync(db, order.id, user_id)


def on_payment_succeeded(db: Session, event: DomainEvent) -> None:
    order_id = (event.payload or {}).get("order_id")
    order = db.query(Order).filter_by(id=order_id).first() if order_id else None
    if order is None:
        return
    notification_service.create(
        db,
        order.user_id,
        {
            "title": "Payment confirmed",
            "body": f"Payment for {order.order_number} succeeded.",
            "channel": "in_app",
            "metadata": {"order_id": order.id},
        },
    )


def on_order_shipped(db: Session, event: DomainEvent) -> None:
    order_id = (event.payload or {}).get("order_id")
    order = db.query(Order).filter_by(id=order_id).first() if order_id else None
    if order is None:
        return
    notification_service.create(
        db,
        order.user_id,
        {"title": "Order shipped", "body": f"{order.order_number} is on the way.", "channel": "in_app"},
    )
    managers = db.query(User).filter(User.role_name.in_(["manager", "admin"])).all()
    for manager in managers:
        notification_service.create(
            db,
            manager.id,
            {"title": "Fulfillment update", "body": f"{order.order_number} was marked shipped.", "channel": "in_app"},
        )


event_bus.subscribe(ORDER_CREATED, on_order_created)
event_bus.subscribe(PAYMENT_SUCCEEDED, on_payment_succeeded)
event_bus.subscribe(ORDER_SHIPPED, on_order_shipped)
