from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AgentRun(Base):
	__tablename__ = "agent_runs"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	agent_id: Mapped[int | None] = mapped_column(ForeignKey("agents.id"), nullable=True)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	objective: Mapped[str] = mapped_column(Text, nullable=False)
	status: Mapped[str] = mapped_column(String(30), default="queued", index=True, nullable=False)
	plan: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
	steps: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
	result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	error: Mapped[str | None] = mapped_column(Text, nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
	started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
