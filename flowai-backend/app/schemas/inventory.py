from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryAdjust(BaseModel):
	quantity_delta: int = Field(description="Positive to add stock, negative to remove stock")
	reorder_level: int | None = Field(default=None, ge=0)
	reason: str = Field(min_length=1, max_length=500)


class InventoryRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	product_id: int
	quantity_on_hand: int
	quantity_reserved: int
	reorder_level: int
	available_quantity: int
	updated_at: datetime
