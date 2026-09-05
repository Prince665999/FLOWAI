from app.agents.base_agent import BaseAgent
class InventoryMonitoringAgent(BaseAgent):
 def __init__(self): super().__init__(allowed_tools={"inventory_check"})
