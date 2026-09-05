from dataclasses import dataclass


@dataclass
class ShippingQuote:
    carrier: str
    service: str
    amount: int
    currency: str
    estimated_days: int


class ShippingProvider:
    def quote(self, *, country: str, postal_code: str | None, subtotal_amount: int) -> ShippingQuote:
        if subtotal_amount >= 10000:
            return ShippingQuote(carrier="FLOWAI Logistics", service="free", amount=0, currency="USD", estimated_days=5)
        return ShippingQuote(carrier="FLOWAI Logistics", service="standard", amount=999, currency="USD", estimated_days=5)


shipping_provider = ShippingProvider()
