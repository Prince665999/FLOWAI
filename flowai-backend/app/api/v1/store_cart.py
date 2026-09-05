from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import require_customer_dep
from app.models.cart_item import CartItem
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead
from app.services.cart_service import cart_service
router=APIRouter(prefix="/store/cart",tags=["store-cart"])
@router.get("",response_model=CartRead)
def get_cart(db:Session=Depends(get_db),user:User=Depends(require_customer_dep)): return cart_service.view(db,user.id)
@router.post("/items",response_model=CartRead)
def add_item(payload:CartItemCreate,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):
    cart=cart_service.active(db,user.id); cart_service.validate(db,payload.product_id,payload.quantity); item=db.query(CartItem).filter_by(cart_id=cart.id,product_id=payload.product_id).first()
    if item: item.quantity += payload.quantity; cart_service.validate(db,payload.product_id,item.quantity)
    else: db.add(CartItem(cart_id=cart.id,product_id=payload.product_id,quantity=payload.quantity))
    db.commit(); return cart_service.view(db,user.id)
@router.put("/items/{item_id}",response_model=CartRead)
def update_item(item_id:int,payload:CartItemUpdate,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):
    cart=cart_service.active(db,user.id); item=db.query(CartItem).filter_by(id=item_id,cart_id=cart.id).first()
    if not item: raise HTTPException(404,"Cart item not found")
    cart_service.validate(db,item.product_id,payload.quantity); item.quantity=payload.quantity; db.commit(); return cart_service.view(db,user.id)
@router.delete("/items/{item_id}",response_model=CartRead)
def delete_item(item_id:int,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):
    cart=cart_service.active(db,user.id); item=db.query(CartItem).filter_by(id=item_id,cart_id=cart.id).first()
    if not item: raise HTTPException(404,"Cart item not found")
    db.delete(item); db.commit(); return cart_service.view(db,user.id)
