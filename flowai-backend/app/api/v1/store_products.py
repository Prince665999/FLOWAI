from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.schemas.product import PublicProductPage, PublicProductRead

router = APIRouter(prefix="/store/products", tags=["store-products"])


def _product_query(db: Session):
	return (
		db.query(Product, func.coalesce(Inventory.quantity_on_hand - Inventory.quantity_reserved, 0).label("available_quantity"))
		.outerjoin(Inventory, Inventory.product_id == Product.id)
		.filter(Product.is_active.is_(True), Product.is_published.is_(True))
	)


def _to_public_product(product: Product, available_quantity: int) -> PublicProductRead:
	return PublicProductRead.model_validate({
		"id": product.id,
		"sku": product.sku,
		"name": product.name,
		"slug": product.slug,
		"description": product.description,
		"short_description": product.short_description,
		"brand": product.brand,
		"category_id": product.category_id,
		"price_amount": product.price_amount,
		"currency": product.currency,
		"image_url": product.image_url,
		"specifications": product.specifications or {},
		"available_quantity": max(0, int(available_quantity or 0)),
	})


@router.get("", response_model=PublicProductPage)
def list_store_products(
	search: str | None = Query(default=None, min_length=1, max_length=120),
	category_id: int | None = Query(default=None, ge=1),
	min_price: int | None = Query(default=None, ge=0),
	max_price: int | None = Query(default=None, ge=0),
	brand: str | None = Query(default=None, min_length=1, max_length=120),
	is_available: bool | None = None,
	page: int = Query(default=1, ge=1),
	page_size: int = Query(default=20, ge=1, le=100),
	sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc|name)$"),
	db: Session = Depends(get_db),
) -> PublicProductPage:
	query = _product_query(db)
	if search:
		term = f"%{search.strip()}%"
		query = query.filter(or_(Product.name.ilike(term), Product.short_description.ilike(term), Product.description.ilike(term), Product.brand.ilike(term), Product.sku.ilike(term)))
	if category_id is not None:
		query = query.filter(Product.category_id == category_id)
	if min_price is not None:
		query = query.filter(Product.price_amount >= min_price)
	if max_price is not None:
		query = query.filter(Product.price_amount <= max_price)
	if brand:
		query = query.filter(Product.brand.ilike(brand.strip()))
	if is_available is True:
		query = query.filter(func.coalesce(Inventory.quantity_on_hand - Inventory.quantity_reserved, 0) > 0)
	elif is_available is False:
		query = query.filter(func.coalesce(Inventory.quantity_on_hand - Inventory.quantity_reserved, 0) <= 0)
	if min_price is not None and max_price is not None and min_price > max_price:
		raise HTTPException(status_code=422, detail="min_price cannot exceed max_price")
	order_column = {"price_asc": asc(Product.price_amount), "price_desc": desc(Product.price_amount), "name": asc(Product.name), "newest": desc(Product.created_at)}[sort]
	total = query.count()
	rows = query.order_by(order_column).offset((page - 1) * page_size).limit(page_size).all()
	return PublicProductPage(items=[_to_public_product(product, available) for product, available in rows], page=page, page_size=page_size, total=total, total_pages=ceil(total / page_size) if total else 0)


@router.get("/{product_id}", response_model=PublicProductRead)
def get_store_product(product_id: int, db: Session = Depends(get_db)) -> PublicProductRead:
	row = _product_query(db).filter(Product.id == product_id).first()
	if row is None:
		raise HTTPException(status_code=404, detail="Product not found")
	return _to_public_product(*row)
