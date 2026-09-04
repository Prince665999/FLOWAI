from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.address import Address
from app.models.user import User
from app.services.audit_service import audit_service


class AddressService:
    def list_addresses(self, db: Session, user: User) -> list[Address]:
        return (
            db.query(Address)
            .filter(Address.user_id == user.id)
            .order_by(Address.is_default.desc(), Address.created_at.desc())
            .all()
        )

    def get_address(self, db: Session, user: User, address_id: int) -> Address:
        address = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        return address

    def create_address(self, db: Session, user: User, data: dict) -> Address:
        if data.get("is_default"):
            self._clear_defaults(db, user.id)
        address = Address(user_id=user.id, **data)
        db.add(address)
        db.commit()
        db.refresh(address)

        audit_service.log_event(
            db=db,
            action="address.create",
            resource_type="address",
            resource_id=address.id,
            user_id=user.id,
            actor_type="user",
        )
        return address

    def update_address(self, db: Session, user: User, address_id: int, updates: dict) -> Address:
        address = self.get_address(db, user, address_id)
        if updates.get("is_default") and not address.is_default:
            self._clear_defaults(db, user.id)
        for field, value in updates.items():
            if value is not None:
                setattr(address, field, value)
        db.commit()
        db.refresh(address)

        audit_service.log_event(
            db=db,
            action="address.update",
            resource_type="address",
            resource_id=address.id,
            user_id=user.id,
            actor_type="user",
        )
        return address

    def delete_address(self, db: Session, user: User, address_id: int) -> None:
        address = self.get_address(db, user, address_id)
        audit_service.log_event(
            db=db,
            action="address.delete",
            resource_type="address",
            resource_id=address.id,
            user_id=user.id,
            actor_type="user",
        )
        db.delete(address)
        db.commit()

    @staticmethod
    def _clear_defaults(db: Session, user_id: int) -> None:
        for addr in db.query(Address).filter(Address.user_id == user_id, Address.is_default.is_(True)):
            addr.is_default = False
        db.flush()


address_service = AddressService()