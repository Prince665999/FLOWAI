from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ScheduleCreate(BaseModel):
    workflow_id: int
    # Keep compatibility with existing clients that only supplied a workflow
    # and cron expression; the route derives a name when one is omitted.
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    cron_expression: str = Field(default="0 8 * * *", min_length=5, max_length=100)
    timezone: str = "UTC"
    is_active: bool = True


class ScheduleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    cron_expression: str | None = None
    timezone: str | None = None
    is_active: bool | None = None


class ScheduleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    workflow_id: int
    name: str
    description: str | None = None
    cron_expression: str
    timezone: str
    is_active: bool
    last_run_at: datetime | None = None
    next_run_at: datetime | None = None
    last_status: str | None = None
    failure_count: int = 0
    created_at: datetime
    updated_at: datetime
