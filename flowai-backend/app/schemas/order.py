from datetime import datetime
from pydantic import BaseModel
class CheckoutRequest(BaseModel):
    address_id: int
    idempotency_key: str
    payment_method: str = "test"
class OrderItemRead(BaseModel):
    id: int; product_id: int; sku: str; product_name: str; unit_price_amount: int; quantity: int; line_total_amount: int
class OrderRead(BaseModel):
    id: int; order_number: str; status: str; payment_status: str; fulfillment_status: str
    subtotal_amount: int; tax_amount: int; shipping_amount: int; total_amount: int; currency: str
    items: list[OrderItemRead]; created_at: datetime
