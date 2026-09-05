from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import require_staff_role_dep
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderRead
from app.services.order_service import order_service
router=APIRouter(prefix="/admin/orders",tags=["admin-orders"])
@router.get("",response_model=list[OrderRead])
def list_orders(status:str|None=None,db:Session=Depends(get_db),user:User=Depends(require_staff_role_dep)):
 query=db.query(Order)
 if status:query=query.filter_by(status=status)
 return [order_service.serialize(db,order) for order in query.order_by(Order.created_at.desc()).all()]
@router.get("/{order_id}",response_model=OrderRead)
def get_order(order_id:int,db:Session=Depends(get_db),user:User=Depends(require_staff_role_dep)):
 order=db.query(Order).filter_by(id=order_id).first()
 if not order:raise HTTPException(404,"Order not found")
 return order_service.serialize(db,order)
