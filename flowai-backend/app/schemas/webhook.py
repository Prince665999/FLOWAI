from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class WebhookPayload(BaseModel):
    event_type: str = Field(default="generic.event", min_length=1)
    data: dict[str, Any] = Field(default_factory=dict)


class WebhookEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: str
    event_type: str
    payload: dict[str, Any]
    status: str
    error: str | None = None
    processed_at: datetime | None = None
    created_at: datetime
