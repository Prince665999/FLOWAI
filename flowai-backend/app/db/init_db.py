from sqlalchemy import inspect, text

from app.db.base import Base
from app.db.session import engine

# Import all models so they are registered with SQLAlchemy metadata
from app.models.address import Address  # noqa: F401
from app.models.agent import Agent  # noqa: F401
from app.models.agent_run import AgentRun  # noqa: F401
from app.models.address import Address  # noqa: F401
from app.models.approval import Approval  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.conversation import Conversation  # noqa: F401
from app.models.cost_record import CostRecord  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.job import Job  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.product_category import ProductCategory  # noqa: F401
from app.models.inventory import Inventory  # noqa: F401
from app.models.inventory_history import InventoryHistory  # noqa: F401
from app.models.cart import Cart  # noqa: F401
from app.models.cart_item import CartItem  # noqa: F401
from app.models.order import Order  # noqa: F401
from app.models.order_item import OrderItem  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.domain_event import DomainEvent  # noqa: F401
from app.models.support_ticket import SupportTicket  # noqa: F401
from app.models.product_review import ProductReview  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.schedule import Schedule  # noqa: F401
from app.models.token import Token  # noqa: F401
from app.models.token import Token  # noqa: F401
from app.models.tool import Tool  # noqa: F401
from app.models.tool_call import ToolCall  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.webhook_event import WebhookEvent  # noqa: F401
from app.models.workflow import Workflow  # noqa: F401
from app.models.workflow_run import WorkflowRun  # noqa: F401
from app.models.workflow_step import WorkflowStep  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_schema()
    _seed_development_catalog()


def _ensure_sqlite_schema() -> None:
    """Add columns that create_all will not attach to existing SQLite tables."""
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        if "users" in tables:
            user_cols = {column["name"] for column in inspector.get_columns("users")}
            if "account_type" not in user_cols:
                conn.execute(
                    text(
                        "ALTER TABLE users ADD COLUMN account_type VARCHAR(20) NOT NULL DEFAULT 'staff'"
                    )
                )
                conn.execute(
                    text("UPDATE users SET account_type = 'customer' WHERE role_name = 'customer'")
                )
                conn.execute(
                    text("CREATE INDEX IF NOT EXISTS ix_users_account_type ON users (account_type)")
                )
            if "email_verified_at" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verified_at DATETIME"))
        if "customers" in tables:
            customer_cols = {column["name"] for column in inspector.get_columns("customers")}
            if "user_id" not in customer_cols:
                conn.execute(text("ALTER TABLE customers ADD COLUMN user_id INTEGER"))
                conn.execute(
                    text("CREATE INDEX IF NOT EXISTS ix_customers_user_id ON customers (user_id)")
                )


def _seed_development_catalog() -> None:
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return
        categories = [
            ProductCategory(name="Laptops", slug="laptops", description="Business laptops and mobile workstations"),
            ProductCategory(name="Monitors", slug="monitors", description="Professional office displays"),
            ProductCategory(name="Networking", slug="networking", description="Business networking equipment"),
        ]
        db.add_all(categories)
        db.flush()
        products = [
            Product(sku="FLOW-LAP-001", name="FlowBook Pro 14", slug="flowbook-pro-14", short_description="A reliable laptop for everyday business work", description="A development catalog laptop for office productivity.", brand="FLOWAI", category_id=categories[0].id, price_amount=89900, currency="USD", is_published=True, specifications={"memory": "16 GB", "storage": "512 GB SSD", "display": "14 inch"}),
            Product(sku="FLOW-MON-001", name="FlowView 27", slug="flowview-27", short_description="A sharp 27-inch monitor for focused work", description="A development catalog monitor for office productivity.", brand="FLOWAI", category_id=categories[1].id, price_amount=24900, currency="USD", is_published=True, specifications={"size": "27 inch", "resolution": "2560x1440", "connectivity": "HDMI, DisplayPort"}),
            Product(sku="FLOW-NET-001", name="FlowLink Router", slug="flowlink-router", short_description="Managed networking for small offices", description="A development catalog business router.", brand="FLOWAI", category_id=categories[2].id, price_amount=17900, currency="USD", is_published=True, specifications={"ports": 8, "wifi": "Wi-Fi 6", "management": "Cloud managed"}),
        ]
        db.add_all(products)
        db.flush()
        db.add_all([Inventory(product_id=product.id, quantity_on_hand=10, quantity_reserved=0, reorder_level=2) for product in products])
        db.commit()
    finally:
        db.close()
