from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import require_employee_or_manager_or_admin
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.product_service import product_service

router = APIRouter(prefix="/admin/products", tags=["admin-products"])


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return db.query(Product).order_by(Product.updated_at.desc()).all()


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return product_service.create(db, payload)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return product_service.get(db, product_id)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return product_service.update(db, product_service.get(db, product_id), payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> None:
	require_employee_or_manager_or_admin(user)
	product_service.delete(db, product_service.get(db, product_id))


@router.post("/{product_id}/publish", response_model=ProductRead)
def publish_product(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	product = product_service.get(db, product_id)
	product.is_published = True
	db.commit()
	db.refresh(product)
	return product


@router.post("/{product_id}/unpublish", response_model=ProductRead)
def unpublish_product(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	product = product_service.get(db, product_id)
	product.is_published = False
	db.commit()
	db.refresh(product)
	return product
