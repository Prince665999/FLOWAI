from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Product(Base):
	__tablename__ = "products"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	sku: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
	name: Mapped[str] = mapped_column(String(255), nullable=False)
	slug: Mapped[str] = mapped_column(String(280), unique=True, index=True, nullable=False)
	description: Mapped[str | None] = mapped_column(Text, nullable=True)
	short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
	brand: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
	category_id: Mapped[int | None] = mapped_column(ForeignKey("product_categories.id"), index=True, nullable=True)
	price_amount: Mapped[int] = mapped_column(Integer, nullable=False)
	currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
	is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
	is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
	image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
	specifications: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
	updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
