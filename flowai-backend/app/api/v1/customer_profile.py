from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, require_customer_dep
from app.db.session import get_db
from app.models.user import User
from app.schemas.customer import CustomerRead, CustomerUpdate
from app.services.customer_service import customer_service

router = APIRouter(prefix="/customer/profile", tags=["customer"])


@router.get("", response_model=CustomerRead)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    return customer_service.get_linked_customer_or_404(db, current_user)


@router.patch("", response_model=CustomerRead)
def update_my_profile(
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    customer = customer_service.get_linked_customer_or_404(db, current_user)
    updates = payload.model_dump(exclude_unset=True)
    # Email changes are handled by User verification; never accept it here.
    updates.pop("email", None)
    for field, value in updates.items():
        if value is not None:
            setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer
