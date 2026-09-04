from typing import Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.user import User
from app.services.audit_service import audit_service


class CustomerService:
    def list_customers(self, db: Session, user: User) -> list[Customer]:
        return (
            db.query(Customer)
            .filter(Customer.user_id == user.id)
            .order_by(Customer.created_at.desc())
            .all()
        )

    def get_customer(self, db: Session, user: User, customer_id: int) -> Customer:
        customer = (
            db.query(Customer)
            .filter(Customer.id == customer_id, Customer.user_id == user.id)
            .first()
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    def create_customer(
        self,
        db: Session,
        user: User,
        name: str,
        email: str | None = None,
        phone: str | None = None,
        company: str | None = None,
        notes: str | None = None,
    ) -> Customer:
        customer = Customer(
            user_id=user.id,
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
            user_id=user.id,
            actor_type="user",
            details={"name": name, "company": company},
        )
        return customer

    def update_customer(
        self,
        db: Session,
        user: User,
        customer_id: int,
        updates: dict[str, Any],
    ) -> Customer:
        customer = self.get_customer(db, user, customer_id)
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
            user_id=user.id,
            actor_type="user",
            details={"updated_fields": list(updates.keys())},
        )
        return customer

    def delete_customer(self, db: Session, user: User, customer_id: int) -> None:
        customer = self.get_customer(db, user, customer_id)
        audit_service.log_event(
            db=db,
            action="customer.delete",
            resource_type="customer",
            resource_id=customer.id,
            user_id=user.id,
            actor_type="user",
            details={"deleted_customer_name": customer.name},
        )
        db.delete(customer)
        db.commit()


customer_service = CustomerService()
