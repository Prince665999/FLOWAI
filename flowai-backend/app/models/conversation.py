from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Conversation(Base):
	__tablename__ = "conversations"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	title: Mapped[str] = mapped_column(String(255), default="New conversation", nullable=False)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
	)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
	)

	messages: Mapped[list["Message"]] = relationship(
		back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at"
	)
