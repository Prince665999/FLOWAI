from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ToolCall(Base):
	__tablename__ = "tool_calls"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	tool_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
	arguments: Mapped[dict] = mapped_column(JSON, nullable=False)
	result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	status: Mapped[str] = mapped_column(String(30), nullable=False)
	error: Mapped[str | None] = mapped_column(Text, nullable=True)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
	)
	completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
