from sqlalchemy.orm import Session

from app.events.event_bus import event_bus
from app.events.event_types import INVENTORY_LOW, INVENTORY_RESERVED
from app.models.domain_event import DomainEvent
from app.models.inventory import Inventory
from app.models.user import User
from app.services.notification_service import notification_service


def on_inventory_reserved(db: Session, event: DomainEvent) -> None:
    order_id = (event.payload or {}).get("order_id")
    if not order_id:
        return
    inventories = db.query(Inventory).all()
    for inventory in inventories:
        available = inventory.quantity_on_hand - inventory.quantity_reserved
        if available <= inventory.reorder_level:
            event_bus.publish(
                db,
                event_type=INVENTORY_LOW,
                aggregate_type="inventory",
                aggregate_id=str(inventory.id),
                idempotency_key=f"inventory-low:{inventory.product_id}:{inventory.quantity_on_hand}:{inventory.quantity_reserved}",
                payload={"product_id": inventory.product_id, "available": available, "reorder_level": inventory.reorder_level},
            )


def on_inventory_low(db: Session, event: DomainEvent) -> None:
    product_id = (event.payload or {}).get("product_id")
    staff = db.query(User).filter(User.role_name.in_(["employee", "manager", "admin"]), User.account_type == "staff").all()
    for user in staff:
        notification_service.create(
            db,
            user.id,
            {
                "title": "Low stock",
                "body": f"Product {product_id} is at or below its reorder level.",
                "channel": "in_app",
                "metadata": event.payload or {},
            },
        )


event_bus.subscribe(INVENTORY_RESERVED, on_inventory_reserved)
event_bus.subscribe(INVENTORY_LOW, on_inventory_low)
