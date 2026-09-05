from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_customer_dep
from app.models.address import Address
from app.models.user import User
from app.schemas.order import CheckoutRequest, OrderRead
from app.services.checkout_service import checkout_service
from app.services.order_service import order_service

router = APIRouter(prefix="/store/checkout", tags=["store-checkout"])


@router.get("/quote")
def quote_checkout(
    address_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(require_customer_dep),
):
    address = None
    if address_id is not None:
        address = db.query(Address).filter_by(id=address_id, user_id=user.id).first()
        if address is None:
            raise HTTPException(404, "Shipping address not found")
    return checkout_service.quote(db, user.id, address)


@router.post("", response_model=OrderRead, status_code=201)
def checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_customer_dep),
):
    address = db.query(Address).filter_by(id=payload.address_id, user_id=user.id).first()
    if not address:
        raise HTTPException(404, "Shipping address not found")
    order = order_service.create(
        db,
        user.id,
        {k: getattr(address, k) for k in ("full_name", "line1", "line2", "city", "state", "postal_code", "country")},
        payload.idempotency_key,
    )
    return order_service.serialize(db, order)
