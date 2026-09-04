from sqlalchemy.orm import Session
from app.models.customer import Customer


class CRMProvider:
    def find_customers(self, db: Session | None, query: str) -> list[Customer]:
        if db is None:
            return []
        pattern = f"%{query}%"
        return (
            db.query(Customer)
            .filter(
                Customer.name.ilike(pattern)
                | Customer.email.ilike(pattern)
                | Customer.company.ilike(pattern)
            )
            .limit(50)
            .all()
        )

    def create_customer(self, db: Session, data: dict) -> Customer:
        customer = Customer(**data)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    def update_customer(self, db: Session, customer_id: int, data: dict) -> Customer | None:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer is None:
            return None
        for field, value in data.items():
            if field in {"name", "email", "phone", "company", "notes"}:
                setattr(customer, field, value)
        db.commit()
        db.refresh(customer)
        return customer
