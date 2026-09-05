from app.agents.base_agent import BaseAgent
class ComplaintResolutionAgent(BaseAgent):
 def __init__(self): super().__init__(allowed_tools={"order_lookup","refund","cancellation"})
