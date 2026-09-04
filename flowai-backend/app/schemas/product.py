from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
	sku: str = Field(min_length=1, max_length=80)
	name: str = Field(min_length=1, max_length=255)
	slug: str = Field(min_length=1, max_length=280)
	description: str | None = None
	short_description: str | None = Field(default=None, max_length=500)
	brand: str | None = Field(default=None, max_length=120)
	category_id: int | None = None
	price_amount: int = Field(ge=0)
	currency: str = Field(default="USD", min_length=3, max_length=3)
	is_published: bool = False
	image_url: str | None = None
	specifications: dict[str, Any] = Field(default_factory=dict)


class ProductUpdate(BaseModel):
	sku: str | None = Field(default=None, min_length=1, max_length=80)
	name: str | None = Field(default=None, min_length=1, max_length=255)
	slug: str | None = Field(default=None, min_length=1, max_length=280)
	description: str | None = None
	short_description: str | None = Field(default=None, max_length=500)
	brand: str | None = Field(default=None, max_length=120)
	category_id: int | None = None
	price_amount: int | None = Field(default=None, ge=0)
	currency: str | None = Field(default=None, min_length=3, max_length=3)
	is_published: bool | None = None
	is_active: bool | None = None
	image_url: str | None = None
	specifications: dict[str, Any] | None = None


class ProductRead(ProductCreate):
	model_config = ConfigDict(from_attributes=True)
	id: int
	is_active: bool
	created_at: datetime
	updated_at: datetime


class ProductListRead(ProductRead):
	available_quantity: int = 0


class PublicProductRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: int
	sku: str
	name: str
	slug: str
	description: str | None = None
	short_description: str | None = None
	brand: str | None = None
	category_id: int | None = None
	price_amount: int
	currency: str
	image_url: str | None = None
	specifications: dict[str, Any] = Field(default_factory=dict)
	available_quantity: int


class PublicProductPage(BaseModel):
	items: list[PublicProductRead]
	page: int
	page_size: int
	total: int
	total_pages: int
