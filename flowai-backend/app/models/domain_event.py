from datetime import datetime, timezone
from sqlalchemy import DateTime, JSON, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class DomainEvent(Base):
    __tablename__ = "domain_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    aggregate_type: Mapped[str] = mapped_column(String(80), index=True)
    aggregate_id: Mapped[str] = mapped_column(String(80), index=True)
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
