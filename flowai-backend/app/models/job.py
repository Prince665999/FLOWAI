from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Job(Base):
	__tablename__ = "jobs"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	job_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
	task_id: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
	idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
	status: Mapped[str] = mapped_column(String(30), default="queued", index=True, nullable=False)
	payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
	result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	error: Mapped[str | None] = mapped_column(Text, nullable=True)
	attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
	started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
