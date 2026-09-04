from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class InventoryHistory(Base):
	__tablename__ = "inventory_history"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True, nullable=False)
	quantity_delta: Mapped[int] = mapped_column(Integer, nullable=False)
	quantity_on_hand: Mapped[int] = mapped_column(Integer, nullable=False)
	quantity_reserved: Mapped[int] = mapped_column(Integer, nullable=False)
	reason: Mapped[str] = mapped_column(Text, nullable=False)
	user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
