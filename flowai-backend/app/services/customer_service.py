from typing import Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.user import User
from app.services.audit_service import audit_service


class CustomerService:
    # ---- Staff CRM views ---------------------------------------------------
    def list_customers(self, db: Session) -> list[Customer]:
        return db.query(Customer).order_by(Customer.created_at.desc()).all()

    def get_customer(self, db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    def create_customer(
        self,
        db: Session,
        actor: User,
        name: str,
        email: str | None = None,
        phone: str | None = None,
        company: str | None = None,
        notes: str | None = None,
        user_id: int | None = None,
    ) -> Customer:
        if user_id is not None:
            existing = db.query(Customer).filter(Customer.user_id == user_id).first()
            if existing:
                raise HTTPException(status_code=409, detail="A customer profile is already linked to this user")
        customer = Customer(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            company=company,
            notes=notes,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        audit_service.log_event(
            db=db,
            action="customer.create",
            resource_type="customer",
            resource_id=customer.id,
            user_id=actor.id,
            actor_type="user",
            details={"name": name, "company": company},
        )
        return customer

    def update_customer(
        self,
        db: Session,
        actor: User,
        customer_id: int,
        updates: dict[str, Any],
    ) -> Customer:
        customer = self.get_customer(db, customer_id)
        for k, v in updates.items():
            if v is not None:
                setattr(customer, k, v)
        db.commit()
        db.refresh(customer)

        audit_service.log_event(
            db=db,
            action="customer.update",
            resource_type="customer",
            resource_id=customer.id,
            user_id=actor.id,
            actor_type="user",
            details={"updated_fields": list(updates.keys())},
        )
        return customer

    def delete_customer(self, db: Session, actor: User, customer_id: int) -> None:
        customer = self.get_customer(db, customer_id)
        audit_service.log_event(
            db=db,
            action="customer.delete",
            resource_type="customer",
            resource_id=customer.id,
            user_id=actor.id,
            actor_type="user",
            details={"deleted_customer_name": customer.name},
        )
        db.delete(customer)
        db.commit()

    # ---- Ownership-scoped views (customer account) ------------------------
    def get_linked_customer(self, db: Session, user: User) -> Customer | None:
        """Return the CRM profile owned by the requesting user, if one exists."""
        return db.query(Customer).filter(Customer.user_id == user.id).first()

    def get_linked_customer_or_404(self, db: Session, user: User) -> Customer:
        customer = self.get_linked_customer(db, user)
        if not customer:
            raise HTTPException(status_code=404, detail="Linked customer profile not found")
        return customer


customer_service = CustomerService()
