from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(24), default="pending", index=True)
    payment_status: Mapped[str] = mapped_column(String(24), default="unpaid", index=True)
    fulfillment_status: Mapped[str] = mapped_column(String(24), default="unfulfilled")
    subtotal_amount: Mapped[int] = mapped_column(Integer, default=0)
    tax_amount: Mapped[int] = mapped_column(Integer, default=0)
    shipping_amount: Mapped[int] = mapped_column(Integer, default=0)
    total_amount: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    shipping_address: Mapped[dict] = mapped_column(JSON, default=dict)
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
