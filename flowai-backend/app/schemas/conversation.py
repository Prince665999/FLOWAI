from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
	title: str = Field(default="New conversation", min_length=1, max_length=255)


class MessageCreate(BaseModel):
	content: str = Field(min_length=1, max_length=20000)


class MessageRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	role: Literal["user", "assistant", "system"]
	content: str
	created_at: datetime


class ConversationRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	title: str
	created_at: datetime
	updated_at: datetime
	messages: list[MessageRead] = []
