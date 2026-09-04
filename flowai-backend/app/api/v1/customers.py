from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import require_staff_dep
from app.db.session import get_db
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.services.customer_service import customer_service

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerRead])
def list_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_dep),
):
    return customer_service.list_customers(db)


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_dep),
):
    data = payload.model_dump()
    return customer_service.create_customer(
        db,
        actor=current_user,
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        notes=data.get("notes"),
        user_id=data.get("user_id"),
    )


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_dep),
):
    return customer_service.get_customer(db, customer_id)


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_dep),
):
    return customer_service.update_customer(
        db,
        actor=current_user,
        customer_id=customer_id,
        updates=payload.model_dump(exclude_unset=True),
    )


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_dep),
):
    customer_service.delete_customer(db, current_user, customer_id)
