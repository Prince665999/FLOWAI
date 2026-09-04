from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import require_customer_dep
from app.db.session import get_db
from app.models.user import User
from app.schemas.address import AddressCreate, AddressRead, AddressUpdate
from app.services.address_service import address_service

router = APIRouter(prefix="/customer/addresses", tags=["customer"])


@router.get("", response_model=list[AddressRead])
def list_my_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    return address_service.list_addresses(db, current_user)


@router.post("", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    return address_service.create_address(db, current_user, payload.model_dump())


@router.get("/{address_id}", response_model=AddressRead)
def get_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    return address_service.get_address(db, current_user, address_id)


@router.put("/{address_id}", response_model=AddressRead)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    return address_service.update_address(db, current_user, address_id, payload.model_dump(exclude_unset=True))


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer_dep),
):
    address_service.delete_address(db, current_user, address_id)
