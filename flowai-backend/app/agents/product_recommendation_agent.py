from app.agents.base_agent import BaseAgent

COMMERCE_RECOMMEND_TOOLS = {"product_search", "inventory_check"}
COMMERCE_SUPPORT_TOOLS = {"product_search", "order_lookup"}
COMMERCE_ORDER_TOOLS = {"order_lookup", "inventory_check", "cancellation"}
COMMERCE_INVENTORY_TOOLS = {"inventory_check", "product_search"}
COMMERCE_COMPLAINT_TOOLS = {"order_lookup", "refund", "cancellation"}


class ProductRecommendationAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=COMMERCE_RECOMMEND_TOOLS)
        self.role = "product_recommendation_agent"


class CustomerSupportAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=COMMERCE_SUPPORT_TOOLS)
        self.role = "customer_support_agent"


class OrderProcessingAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=COMMERCE_ORDER_TOOLS)
        self.role = "order_processing_agent"


class InventoryMonitoringAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=COMMERCE_INVENTORY_TOOLS)
        self.role = "inventory_monitoring_agent"


class ComplaintResolutionAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=COMMERCE_COMPLAINT_TOOLS)
        self.role = "complaint_resolution_agent"


product_recommendation_agent = ProductRecommendationAgent()
customer_support_agent = CustomerSupportAgent()
order_processing_agent = OrderProcessingAgent()
inventory_monitoring_agent = InventoryMonitoringAgent()
complaint_resolution_agent = ComplaintResolutionAgent()
