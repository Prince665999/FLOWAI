from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Document(Base):
	__tablename__ = "documents"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	filename: Mapped[str] = mapped_column(String(255), nullable=False)
	storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
	content_type: Mapped[str] = mapped_column(String(255), nullable=False)
	size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
	status: Mapped[str] = mapped_column(String(30), default="ready", nullable=False)
	extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
	)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
	)
