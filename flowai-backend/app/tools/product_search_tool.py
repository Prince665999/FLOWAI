from app.tools.base_tool import BaseTool,ToolContext
from app.models.product import Product
class ProductSearchTool(BaseTool):
 name="product_search";description="Searches published catalog products";input_schema={"type":"object","properties":{"query":{"type":"string"}}};permissions={"catalog:read"}
 async def execute(self,arguments,context):
  query=str(arguments.get("query","")).strip(); products=context.db.query(Product).filter(Product.is_active.is_(True),Product.is_published.is_(True),Product.name.ilike(f"%{query}%")).limit(10).all()
  return {"products":[{"id":p.id,"name":p.name,"price_amount":p.price_amount,"currency":p.currency,"specifications":p.specifications} for p in products]}
