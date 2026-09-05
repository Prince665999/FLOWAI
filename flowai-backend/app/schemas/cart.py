from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=100)
class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0, le=100)
class CartItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    quantity: int
    unit_price_amount: int
    line_total_amount: int
    name: str | None = None
    slug: str | None = None
    image_url: str | None = None
class CartRead(BaseModel):
    id: int; status: str; items: list[CartItemRead]; subtotal_amount: int; currency: str
