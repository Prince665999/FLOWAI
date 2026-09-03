from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ToolDefinition(BaseModel):
	name: str
	description: str
	parameters: dict[str, Any]
	permissions: list[str]


class ToolInvokeRequest(BaseModel):
	arguments: dict[str, Any] = Field(default_factory=dict)


class ToolCallRead(BaseModel):
	id: int
	tool_name: str
	arguments: dict[str, Any]
	result: dict[str, Any] | None = None
	status: str
	error: str | None = None
	created_at: datetime
