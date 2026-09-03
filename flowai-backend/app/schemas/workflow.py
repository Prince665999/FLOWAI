from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class WorkflowNode(BaseModel):
	id: str = Field(min_length=1, max_length=100)
	type: str = Field(min_length=1, max_length=50)
	config: dict[str, Any] = Field(default_factory=dict)


class WorkflowEdge(BaseModel):
	source: str
	target: str
	condition: str | None = None


class WorkflowDefinition(BaseModel):
	nodes: list[WorkflowNode] = Field(min_length=1)
	edges: list[WorkflowEdge] = Field(default_factory=list)


class WorkflowCreate(BaseModel):
	name: str = Field(min_length=1, max_length=255)
	description: str | None = None
	definition: WorkflowDefinition


class WorkflowUpdate(BaseModel):
	name: str | None = Field(default=None, min_length=1, max_length=255)
	description: str | None = None
	definition: WorkflowDefinition | None = None
	is_active: bool | None = None


class WorkflowRunCreate(BaseModel):
	input_data: dict[str, Any] = Field(default_factory=dict)


class WorkflowStepRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	node_id: str
	node_type: str
	status: str
	input_data: dict[str, Any] | None = None
	output_data: dict[str, Any] | None = None
	error: str | None = None
	started_at: datetime | None = None
	completed_at: datetime | None = None


class WorkflowRunRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	workflow_id: int
	status: str
	input_data: dict[str, Any] | None = None
	output_data: dict[str, Any] | None = None
	error: str | None = None
	current_node_id: str | None = None
	created_at: datetime
	started_at: datetime | None = None
	completed_at: datetime | None = None
	steps: list[WorkflowStepRead] = Field(default_factory=list)


class WorkflowRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	name: str
	description: str | None = None
	definition: WorkflowDefinition
	is_active: bool
	created_at: datetime
	updated_at: datetime


class WorkflowDetailRead(WorkflowRead):
	runs: list[WorkflowRunRead] = Field(default_factory=list)
