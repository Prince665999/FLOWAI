from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Notification(Base):
	__tablename__ = "notifications"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	title: Mapped[str] = mapped_column(String(255), nullable=False)
	body: Mapped[str] = mapped_column(Text, nullable=False)
	channel: Mapped[str] = mapped_column(String(30), default="in_app", nullable=False)
	metadata_json: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)
	is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
	)
