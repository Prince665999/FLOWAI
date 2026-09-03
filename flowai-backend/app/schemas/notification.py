from datetime import datetime

from pydantic import BaseModel


class NotificationCreate(BaseModel):
	title: str
	body: str
	channel: str = "in_app"
	metadata: dict | None = None


class NotificationRead(NotificationCreate):
	id: int
	user_id: int
	is_read: bool
	created_at: datetime
