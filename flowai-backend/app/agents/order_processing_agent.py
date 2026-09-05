from app.agents.base_agent import BaseAgent
class OrderProcessingAgent(BaseAgent):
 def __init__(self): super().__init__(allowed_tools={"order_lookup","inventory_check"})
