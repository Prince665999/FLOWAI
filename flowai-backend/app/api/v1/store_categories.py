from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product_category import ProductCategory
from app.schemas.category import PublicCategoryRead
from app.schemas.product import PublicProductPage
from app.api.v1.store_products import list_store_products

router = APIRouter(prefix="/store/categories", tags=["store-categories"])


@router.get("", response_model=list[PublicCategoryRead])
def list_store_categories(db: Session = Depends(get_db)) -> list[ProductCategory]:
	return db.query(ProductCategory).filter(ProductCategory.is_active.is_(True)).order_by(ProductCategory.name).all()


@router.get("/slug/{slug}", response_model=PublicCategoryRead)
def get_store_category_by_slug(slug: str, db: Session = Depends(get_db)) -> ProductCategory:
	category = db.query(ProductCategory).filter(ProductCategory.slug == slug, ProductCategory.is_active.is_(True)).first()
	if category is None:
		raise HTTPException(status_code=404, detail="Category not found")
	return category


@router.get("/{category_id}/products", response_model=PublicProductPage)
def list_category_products(
	category_id: int,
	search: str | None = Query(default=None, min_length=1, max_length=120),
	min_price: int | None = Query(default=None, ge=0),
	max_price: int | None = Query(default=None, ge=0),
	brand: str | None = Query(default=None, min_length=1, max_length=120),
	is_available: bool | None = None,
	page: int = Query(default=1, ge=1),
	page_size: int = Query(default=20, ge=1, le=100),
	sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc|name)$"),
	db: Session = Depends(get_db),
) -> PublicProductPage:
	category = db.query(ProductCategory).filter(ProductCategory.id == category_id, ProductCategory.is_active.is_(True)).first()
	if category is None:
		raise HTTPException(status_code=404, detail="Category not found")
	return list_store_products(search=search, category_id=category_id, min_price=min_price, max_price=max_price, brand=brand, is_available=is_available, page=page, page_size=page_size, sort=sort, db=db)
