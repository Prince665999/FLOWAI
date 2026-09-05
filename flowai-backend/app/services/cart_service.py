from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.inventory import Inventory
from app.models.product import Product

class CartService:
    def active(self, db: Session, user_id: int) -> Cart:
        cart = db.query(Cart).filter_by(user_id=user_id, status="active").first()
        if not cart:
            cart = Cart(user_id=user_id); db.add(cart); db.flush()
        return cart
    def validate(self, db: Session, product_id: int, quantity: int) -> Product:
        product = db.query(Product).filter_by(id=product_id, is_active=True, is_published=True).first()
        inventory = db.query(Inventory).filter_by(product_id=product_id).first()
        if not product or not inventory or inventory.quantity_on_hand - inventory.quantity_reserved < quantity:
            raise HTTPException(409, "Product is unavailable in the requested quantity")
        return product
    def view(self, db: Session, user_id: int) -> dict:
        cart=self.active(db,user_id); items=[]; subtotal=0
        for item in db.query(CartItem).filter_by(cart_id=cart.id):
            product=self.validate(db,item.product_id,item.quantity); total=product.price_amount*item.quantity; subtotal += total
            items.append({"id":item.id,"product_id":item.product_id,"quantity":item.quantity,"unit_price_amount":product.price_amount,"line_total_amount":total})
        return {"id":cart.id,"status":cart.status,"items":items,"subtotal_amount":subtotal,"currency":"USD"}
cart_service=CartService()
