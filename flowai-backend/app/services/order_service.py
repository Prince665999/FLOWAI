import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.customer import Customer
from app.models.inventory import Inventory
from app.models.inventory_history import InventoryHistory
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.events.event_bus import event_bus
from app.events.event_types import INVENTORY_RESERVED, ORDER_CREATED

class OrderService:
    def serialize(self, db: Session, order: Order) -> dict:
        items=[{"id":i.id,"product_id":i.product_id,"sku":i.sku,"product_name":i.product_name,"unit_price_amount":i.unit_price_amount,"quantity":i.quantity,"line_total_amount":i.line_total_amount} for i in db.query(OrderItem).filter_by(order_id=order.id)]
        return {**{k:getattr(order,k) for k in ("id","order_number","status","payment_status","fulfillment_status","subtotal_amount","tax_amount","shipping_amount","total_amount","currency","created_at")},"items":items}
    def create(self, db: Session, user_id: int, address: dict, key: str) -> Order:
        existing=db.query(Order).filter_by(idempotency_key=key).first()
        if existing:
            if existing.user_id != user_id: raise HTTPException(409,"Idempotency key already used")
            return existing
        cart=db.query(Cart).filter_by(user_id=user_id,status="active").first()
        lines=db.query(CartItem).filter_by(cart_id=cart.id).all() if cart else []
        if not lines: raise HTTPException(422,"Cart is empty")
        prepared=[]; subtotal=0
        for line in lines:
            product=db.query(Product).filter_by(id=line.product_id,is_active=True,is_published=True).first(); inv=db.query(Inventory).filter_by(product_id=line.product_id).with_for_update().first()
            if not product or not inv or inv.quantity_on_hand-inv.quantity_reserved < line.quantity: raise HTTPException(409,"Insufficient inventory")
            prepared.append((line,product,inv)); subtotal += product.price_amount*line.quantity
        customer=db.query(Customer).filter_by(user_id=user_id).first()
        order=Order(order_number=f"FLW-{uuid.uuid4().hex[:10].upper()}",user_id=user_id,customer_id=customer.id if customer else None,subtotal_amount=subtotal,total_amount=subtotal,currency="USD",shipping_address=address,idempotency_key=key)
        db.add(order); db.flush()
        for line,product,inv in prepared:
            inv.quantity_reserved += line.quantity
            db.add(InventoryHistory(product_id=product.id,quantity_delta=0,quantity_on_hand=inv.quantity_on_hand,quantity_reserved=inv.quantity_reserved,reason=f"Reserved for {order.order_number}",user_id=user_id))
            db.add(OrderItem(order_id=order.id,product_id=product.id,sku=product.sku,product_name=product.name,unit_price_amount=product.price_amount,quantity=line.quantity,line_total_amount=product.price_amount*line.quantity))
        cart.status="converted"
        event_bus.publish(db,event_type=ORDER_CREATED,aggregate_type="order",aggregate_id=str(order.id),idempotency_key=f"order-created:{order.id}",payload={"order_id":order.id,"user_id":user_id})
        event_bus.publish(db,event_type=INVENTORY_RESERVED,aggregate_type="order",aggregate_id=str(order.id),idempotency_key=f"inventory-reserved:{order.id}",payload={"order_id":order.id})
        db.commit(); db.refresh(order); return order

    def cancel(self, db: Session, order: Order, user_id: int) -> Order:
        if order.status in {"cancelled", "delivered", "fulfilled", "shipped"}:
            raise HTTPException(409, "This order can no longer be cancelled")
        items = db.query(OrderItem).filter_by(order_id=order.id).all()
        for item in items:
            inv = db.query(Inventory).filter_by(product_id=item.product_id).with_for_update().first()
            if inv:
                inv.quantity_reserved = max(0, inv.quantity_reserved - item.quantity)
                db.add(InventoryHistory(
                    product_id=item.product_id,
                    quantity_delta=0,
                    quantity_on_hand=inv.quantity_on_hand,
                    quantity_reserved=inv.quantity_reserved,
                    reason=f"Released reservation for cancelled {order.order_number}",
                    user_id=user_id,
                ))
        order.status = "cancelled"
        order.fulfillment_status = "cancelled"
        if order.payment_status == "unpaid":
            order.payment_status = "cancelled"
        db.commit()
        db.refresh(order)
        return order
order_service=OrderService()
