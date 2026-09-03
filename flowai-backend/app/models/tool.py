from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Tool(Base):
	__tablename__ = "tools"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
	description: Mapped[str] = mapped_column(Text, nullable=False)
	input_schema: Mapped[dict] = mapped_column(JSON, nullable=False)
	permissions: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
	is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
	)
