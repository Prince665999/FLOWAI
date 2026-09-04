from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product_category import ProductCategory
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
	def create(self, db: Session, payload: CategoryCreate) -> ProductCategory:
		category = ProductCategory(**payload.model_dump())
		db.add(category)
		db.commit()
		db.refresh(category)
		return category

	def update(self, db: Session, category: ProductCategory, payload: CategoryUpdate) -> ProductCategory:
		for field, value in payload.model_dump(exclude_unset=True).items():
			setattr(category, field, value)
		db.commit()
		db.refresh(category)
		return category

	def get(self, db: Session, category_id: int) -> ProductCategory:
		category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
		if category is None:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
		return category


category_service = CategoryService()
