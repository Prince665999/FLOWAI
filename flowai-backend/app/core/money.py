from decimal import Decimal, ROUND_HALF_UP


def to_minor_units(amount: Decimal | int | float | str) -> int:
	return int((Decimal(str(amount)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def from_minor_units(amount: int) -> Decimal:
	return (Decimal(amount) / 100).quantize(Decimal("0.01"))
