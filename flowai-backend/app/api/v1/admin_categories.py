from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.product_category import ProductCategory
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services.category_service import category_service

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_admin(user)
	return db.query(ProductCategory).order_by(ProductCategory.name).all()


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_admin(user)
	return category_service.create(db, payload)


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_admin(user)
	return category_service.update(db, category_service.get(db, category_id), payload)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)) -> None:
	require_admin(user)
	category = category_service.get(db, category_id)
	category.is_active = False
	db.commit()
