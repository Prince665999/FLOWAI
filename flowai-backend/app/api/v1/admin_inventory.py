from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_employee_or_manager_or_admin
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.inventory import InventoryAdjust, InventoryRead
from app.services.inventory_service import inventory_service

router = APIRouter(prefix="/admin/inventory", tags=["admin-inventory"])


@router.get("", response_model=list[InventoryRead])
def list_inventory(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return [inventory_service.to_read(item) for item in db.query(Inventory).order_by(Inventory.updated_at.desc()).all()]


@router.get("/low-stock", response_model=list[InventoryRead])
def low_stock(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	items = db.query(Inventory).all()
	return [inventory_service.to_read(item) for item in items if item.quantity_on_hand - item.quantity_reserved <= item.reorder_level]


@router.get("/{product_id}", response_model=InventoryRead)
def get_inventory(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return inventory_service.to_read(inventory_service.get_or_create(db, product_id))


@router.post("/{product_id}/adjust", response_model=InventoryRead)
def adjust_inventory(product_id: int, payload: InventoryAdjust, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
	require_employee_or_manager_or_admin(user)
	return inventory_service.to_read(inventory_service.adjust(db, product_id, payload, user.id))
