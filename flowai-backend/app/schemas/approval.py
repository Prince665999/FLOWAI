from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ApprovalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    action_type: str = "generic_action"
    payload: dict[str, Any] = Field(default_factory=dict)
    workflow_run_id: int | None = None
    agent_run_id: int | None = None
    step_id: int | None = None


class ApprovalActionRequest(BaseModel):
    action: str = Field(description="Action to take: approve, reject, or edit")
    payload: dict[str, Any] | None = Field(default=None, description="Updated payload if editing")
    comment: str | None = None


class ApprovalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    workflow_run_id: int | None = None
    agent_run_id: int | None = None
    step_id: int | None = None
    title: str
    description: str | None = None
    action_type: str
    payload: dict[str, Any]
    status: str
    reviewer_id: int | None = None
    review_comment: str | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
