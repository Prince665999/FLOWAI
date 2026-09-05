from app.tools.base_tool import BaseTool


class ToolNotFoundError(KeyError):
	pass


class ToolRegistry:
	def __init__(self) -> None:
		self._tools: dict[str, BaseTool] = {}

	def register(self, tool: BaseTool) -> BaseTool:
		if tool.name in self._tools:
			raise ValueError(f"Tool already registered: {tool.name}")
		self._tools[tool.name] = tool
		return tool

	def get(self, name: str) -> BaseTool:
		try:
			return self._tools[name]
		except KeyError as exc:
			raise ToolNotFoundError(name) from exc

	def list_definitions(self) -> list[dict]:
		return [tool.definition() for tool in self._tools.values()]

	def names(self) -> list[str]:
		return sorted(self._tools)


tool_registry = ToolRegistry()


def register_builtin_tools() -> None:
	from app.tools.calculator_tool import CalculatorTool
	from app.tools.calendar_tool import CalendarTool
	from app.tools.crm_tool import CRMTool
	from app.tools.database_tool import DatabaseTool
	from app.tools.email_tool import EmailTool
	from app.tools.file_tool import FileTool
	from app.tools.notification_tool import NotificationTool
	from app.tools.weather_tool import WeatherTool
	from app.tools.web_search_tool import WebSearchTool
	from app.tools.product_search_tool import ProductSearchTool
	from app.tools.order_lookup_tool import OrderLookupTool
	from app.tools.inventory_check_tool import InventoryCheckTool
	from app.tools.refund_tool import RefundTool
	from app.tools.cancellation_tool import CancellationTool

	for tool_class in (CRMTool, EmailTool, CalendarTool, DatabaseTool, FileTool, WebSearchTool, CalculatorTool, WeatherTool, NotificationTool, ProductSearchTool, OrderLookupTool, InventoryCheckTool, RefundTool, CancellationTool):
		if tool_class.name not in tool_registry.names():
			tool_registry.register(tool_class())


register_builtin_tools()
