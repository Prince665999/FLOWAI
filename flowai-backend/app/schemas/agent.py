from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AgentCreate(BaseModel):
	name: str = Field(min_length=1, max_length=100)
	description: str | None = None
	allowed_tools: list[str] = Field(default_factory=list)


class AgentRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	name: str
	description: str | None = None
	allowed_tools: list[str]
	is_active: bool


class AgentRunCreate(BaseModel):
	objective: str = Field(min_length=1, max_length=20000)
	agent_id: int | None = None


class AgentStepRead(BaseModel):
	step: int
	description: str
	tool: str | None = None
	status: str
	arguments: dict[str, Any] = Field(default_factory=dict)
	observation: dict[str, Any] | None = None
	error: str | None = None


class AgentRunRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	agent_id: int | None = None
	objective: str
	status: str
	plan: list[dict[str, Any]]
	steps: list[AgentStepRead]
	result: dict[str, Any] | None = None
	error: str | None = None
	created_at: datetime
	started_at: datetime | None = None
	completed_at: datetime | None = None
