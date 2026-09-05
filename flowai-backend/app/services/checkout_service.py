from sqlalchemy.orm import Session

from app.models.address import Address
from app.services.cart_service import cart_service
from app.services.pricing_service import pricing_service


class CheckoutService:
    def quote(self, db: Session, user_id: int, address: Address | None = None) -> dict:
        cart = cart_service.active(db, user_id)
        view = cart_service.view(db, user_id)
        price = pricing_service.quote_cart(db, cart)
        return {
            **view,
            "subtotal_amount": price.subtotal_amount,
            "tax_amount": price.tax_amount,
            "shipping_amount": price.shipping_amount,
            "total_amount": price.total_amount,
            "currency": price.currency,
            "shipping_address": None
            if address is None
            else {
                "id": address.id,
                "full_name": address.full_name,
                "line1": address.line1,
                "line2": address.line2,
                "city": address.city,
                "state": address.state,
                "postal_code": address.postal_code,
                "country": address.country,
            },
        }


checkout_service = CheckoutService()
