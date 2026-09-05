from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_review import ProductReview
from app.schemas.review import ReviewCreate
class ReviewService:
    def create(self,db:Session,user_id:int,payload:ReviewCreate)->ProductReview:
        order=db.query(Order).filter_by(id=payload.order_id,user_id=user_id,payment_status="paid").first()
        if not order or not db.query(OrderItem).filter_by(order_id=order.id,product_id=payload.product_id).first():raise HTTPException(403,"Only verified purchasers may review this product")
        review=ProductReview(user_id=user_id,**payload.model_dump());db.add(review);db.commit();db.refresh(review);return review
review_service=ReviewService()
