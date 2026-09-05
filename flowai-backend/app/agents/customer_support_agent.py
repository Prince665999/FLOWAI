from app.agents.base_agent import BaseAgent
class CustomerSupportAgent(BaseAgent):
 def __init__(self): super().__init__(allowed_tools={"product_search","order_lookup"})
