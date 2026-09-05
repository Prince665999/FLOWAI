from app.tools.base_tool import BaseTool,ToolContext
from app.models.inventory import Inventory
class InventoryCheckTool(BaseTool):
 name="inventory_check";description="Checks available stock";input_schema={"type":"object","properties":{"product_id":{"type":"integer"}}};permissions={"inventory:read"}
 async def execute(self,arguments,context):
  item=context.db.query(Inventory).filter_by(product_id=int(arguments["product_id"])).first(); available=0 if not item else item.quantity_on_hand-item.quantity_reserved
  return {"product_id":arguments["product_id"],"available_quantity":max(0,available)}
