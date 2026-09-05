from pydantic import BaseModel
class PaymentIntentRequest(BaseModel):
    order_id: int
    idempotency_key: str
class PaymentRead(BaseModel):
    id: int; order_id: int; provider: str; status: str; amount: int; currency: str
