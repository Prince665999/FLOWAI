from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	filename: str
	content_type: str
	size_bytes: int
	status: str
	created_at: datetime
	updated_at: datetime


class Citation(BaseModel):
	document_id: int
	filename: str
	chunk_index: int
	content: str
	score: float
