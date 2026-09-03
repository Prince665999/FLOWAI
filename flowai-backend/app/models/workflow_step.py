from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WorkflowStep(Base):
	__tablename__ = "workflow_steps"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	run_id: Mapped[int] = mapped_column(ForeignKey("workflow_runs.id"), index=True, nullable=False)
	node_id: Mapped[str] = mapped_column(String(100), nullable=False)
	node_type: Mapped[str] = mapped_column(String(50), nullable=False)
	status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)
	input_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	output_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
	error: Mapped[str | None] = mapped_column(Text, nullable=True)
	started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
