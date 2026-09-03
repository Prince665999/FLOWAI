from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WorkflowRun(Base):
	__tablename__ = "workflow_runs"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), index=True, nullable=False)
	user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
	status: Mapped[str] = mapped_column(String(30), default="queued", nullable=False)
	input_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	output_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	error: Mapped[str | None] = mapped_column(Text, nullable=True)
	current_node_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
	started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
