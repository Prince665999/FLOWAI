from app.tools.base_tool import BaseTool,ToolContext
class RefundTool(BaseTool):
 name="refund";description="Requests a manager-approved refund; it never executes one directly";input_schema={"type":"object","properties":{"order_id":{"type":"integer"}}};permissions={"refund:request"}
 async def execute(self,arguments,context): return {"status":"approval_required","order_id":arguments["order_id"]}
