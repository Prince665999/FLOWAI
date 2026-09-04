from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
	name: str = Field(min_length=1, max_length=120)
	slug: str = Field(min_length=1, max_length=140)
	description: str | None = None


class CategoryUpdate(BaseModel):
	name: str | None = Field(default=None, min_length=1, max_length=120)
	slug: str | None = Field(default=None, min_length=1, max_length=140)
	description: str | None = None
	is_active: bool | None = None


class CategoryRead(CategoryCreate):
	model_config = ConfigDict(from_attributes=True)
	id: int
	is_active: bool
	created_at: datetime
	updated_at: datetime
