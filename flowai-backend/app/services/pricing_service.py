from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product

TAX_BPS = 800  # 8.00%
FREE_SHIPPING_THRESHOLD = 10000
FLAT_SHIPPING_AMOUNT = 999


@dataclass
class PriceQuote:
    subtotal_amount: int
    tax_amount: int
    shipping_amount: int
    total_amount: int
    currency: str
    lines: list[dict]


class PricingService:
    def quote_lines(self, lines: list[tuple[Product, int]], currency: str = "USD") -> PriceQuote:
        priced = []
        subtotal = 0
        for product, quantity in lines:
            line_total = product.price_amount * quantity
            subtotal += line_total
            priced.append(
                {
                    "product_id": product.id,
                    "sku": product.sku,
                    "product_name": product.name,
                    "quantity": quantity,
                    "unit_price_amount": product.price_amount,
                    "line_total_amount": line_total,
                    "currency": product.currency,
                }
            )
        tax_amount = (subtotal * TAX_BPS) // 10000
        shipping_amount = 0 if subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0 else FLAT_SHIPPING_AMOUNT
        return PriceQuote(
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=subtotal + tax_amount + shipping_amount,
            currency=currency,
            lines=priced,
        )

    def quote_cart(self, db: Session, cart: Cart) -> PriceQuote:
        items = db.query(CartItem).filter_by(cart_id=cart.id).all()
        lines: list[tuple[Product, int]] = []
        for item in items:
            product = db.query(Product).filter_by(id=item.product_id, is_active=True, is_published=True).first()
            if product:
                lines.append((product, item.quantity))
        return self.quote_lines(lines)


pricing_service = PricingService()
