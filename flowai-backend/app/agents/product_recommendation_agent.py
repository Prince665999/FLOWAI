from app.agents.base_agent import BaseAgent
class ProductRecommendationAgent(BaseAgent):
 def __init__(self): super().__init__(allowed_tools={"product_search","inventory_check"})
