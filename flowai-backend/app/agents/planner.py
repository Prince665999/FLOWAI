import re


class Planner:
	def plan(self, objective: str, allowed_tools: set[str]) -> list[dict]:
		text = objective.lower()
		tasks = []
		if "customer" in text or "crm" in text:
			tasks.append({"description": "Retrieve relevant customer records", "tool": "crm", "arguments": {"action": "find", "query": objective}})
		if "email" in text or "complaint" in text:
			tasks.append({"description": "Review relevant email messages", "tool": "email", "arguments": {"action": "search", "query": objective}})
		if "weather" in text:
			tasks.append({"description": "Retrieve current weather", "tool": "weather", "arguments": {}})
		if "document" in text or "file" in text:
			tasks.append({"description": "Review available business documents", "tool": "file", "arguments": {"action": "list"}})
		if not tasks:
			tasks.append({"description": "Analyze the objective and prepare an outcome", "tool": None, "arguments": {"objective": objective}})
		return [task for task in tasks if task["tool"] is None or task["tool"] in allowed_tools]


planner = Planner()
