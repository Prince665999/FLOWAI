from app.tools.base_tool import BaseTool,ToolContext
class CancellationTool(BaseTool):
 name="cancellation";description="Requests an approval-gated cancellation";input_schema={"type":"object","properties":{"order_id":{"type":"integer"}}};permissions={"orders:cancel:request"}
 async def execute(self,arguments,context): return {"status":"approval_required","order_id":arguments["order_id"]}
