from app.models.product import Product
def grounded_product_facts(db, product_ids:list[int]) -> list[dict]:
    """Return only database-backed facts safe to present to customers."""
    products=db.query(Product).filter(Product.id.in_(product_ids),Product.is_published.is_(True),Product.is_active.is_(True)).all()
    return [{"id":p.id,"name":p.name,"price_amount":p.price_amount,"currency":p.currency,"specifications":p.specifications,"description":p.description} for p in products]
