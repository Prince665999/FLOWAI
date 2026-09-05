from app.integrations.payments.provider import PaymentProvider
class TestPaymentProvider(PaymentProvider):
 def create_intent(self,**data):return {"id":f"test_{data['idempotency_key']}","status":"succeeded","amount":data["amount"],"currency":data["currency"]}
 def verify_webhook(self,payload,signature):return {"verified":signature=="test-signature"}
 def refund(self,provider_payment_id,amount=None):return {"id":provider_payment_id,"status":"refunded","amount":amount}
