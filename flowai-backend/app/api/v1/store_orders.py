from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import require_customer_dep
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderRead
from app.services.order_service import order_service
router=APIRouter(prefix="/store/orders",tags=["store-orders"])
@router.get("",response_model=list[OrderRead])
def orders(db:Session=Depends(get_db),user:User=Depends(require_customer_dep)): return [order_service.serialize(db,o) for o in db.query(Order).filter_by(user_id=user.id).order_by(Order.created_at.desc())]
@router.get("/{order_id}",response_model=OrderRead)
def order(order_id:int,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):
    found=db.query(Order).filter_by(id=order_id,user_id=user.id).first()
    if not found: raise HTTPException(404,"Order not found")
    return order_service.serialize(db,found)
