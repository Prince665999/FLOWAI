from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
	def create(self, db: Session, payload: ProductCreate) -> Product:
		product = Product(**payload.model_dump())
		db.add(product)
		db.commit()
		db.refresh(product)
		return product

	def update(self, db: Session, product: Product, payload: ProductUpdate) -> Product:
		for field, value in payload.model_dump(exclude_unset=True).items():
			setattr(product, field, value)
		db.commit()
		db.refresh(product)
		return product

	def get(self, db: Session, product_id: int) -> Product:
		product = db.query(Product).filter(Product.id == product_id).first()
		if product is None:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
		return product

	def delete(self, db: Session, product: Product) -> None:
		product.is_active = False
		product.is_published = False
		db.commit()

	@staticmethod
	def available_quantity(db: Session, product_id: int) -> int:
		inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
		return max(0, inventory.quantity_on_hand - inventory.quantity_reserved) if inventory else 0


product_service = ProductService()
