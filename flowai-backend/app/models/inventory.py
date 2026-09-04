from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Inventory(Base):
	__tablename__ = "inventory"
	__table_args__ = (CheckConstraint("quantity_on_hand >= 0"), CheckConstraint("quantity_reserved >= 0"),)

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True, index=True, nullable=False)
	quantity_on_hand: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	quantity_reserved: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	reorder_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
