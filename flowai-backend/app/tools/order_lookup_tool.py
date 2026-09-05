from app.tools.base_tool import BaseTool,ToolContext
from app.models.order import Order
class OrderLookupTool(BaseTool):
 name="order_lookup";description="Looks up only the acting customer's orders";input_schema={"type":"object","properties":{"order_id":{"type":"integer"}}};permissions={"orders:own:read"}
 async def execute(self,arguments,context):
  order=context.db.query(Order).filter_by(id=int(arguments["order_id"]),user_id=context.user_id).first()
  return {"found":bool(order),"order":None if not order else {"id":order.id,"number":order.order_number,"status":order.status,"payment_status":order.payment_status}}
