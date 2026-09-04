from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.inventory_history import InventoryHistory
from app.models.product import Product
from app.schemas.inventory import InventoryAdjust
from app.services.audit_service import audit_service


class InventoryService:
	def get_or_create(self, db: Session, product_id: int) -> Inventory:
		inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
		if inventory is None:
			if db.query(Product).filter(Product.id == product_id).first() is None:
				raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
			inventory = Inventory(product_id=product_id)
			db.add(inventory)
			db.flush()
		return inventory

	def adjust(self, db: Session, product_id: int, payload: InventoryAdjust, user_id: int) -> Inventory:
		inventory = self.get_or_create(db, product_id)
		new_quantity = inventory.quantity_on_hand + payload.quantity_delta
		if new_quantity < inventory.quantity_reserved:
			raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Stock cannot be below reserved quantity")
		inventory.quantity_on_hand = new_quantity
		if payload.reorder_level is not None:
			inventory.reorder_level = payload.reorder_level
		db.add(InventoryHistory(product_id=product_id, quantity_delta=payload.quantity_delta, quantity_on_hand=inventory.quantity_on_hand, quantity_reserved=inventory.quantity_reserved, reason=payload.reason, user_id=user_id))
		db.commit()
		db.refresh(inventory)
		audit_service.log_event(db, action="inventory_adjusted", resource_type="inventory", resource_id=product_id, user_id=user_id, details={"quantity_delta": payload.quantity_delta, "reason": payload.reason})
		return inventory

	@staticmethod
	def to_read(inventory: Inventory) -> dict:
		return {"id": inventory.id, "product_id": inventory.product_id, "quantity_on_hand": inventory.quantity_on_hand, "quantity_reserved": inventory.quantity_reserved, "reorder_level": inventory.reorder_level, "available_quantity": max(0, inventory.quantity_on_hand - inventory.quantity_reserved), "updated_at": inventory.updated_at}


inventory_service = InventoryService()
