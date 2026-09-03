from typing import Any

import httpx

from app.tools.base_tool import BaseTool, ToolContext


class WebSearchTool(BaseTool):
    name = "web_search"
    description = "Search the public web using DuckDuckGo Instant Answer."
    permissions = {"web.search"}
    input_schema = {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("https://api.duckduckgo.com/", params={"q": arguments["query"], "format": "json", "no_html": 1})
            response.raise_for_status()
        data = response.json()
        return {"abstract": data.get("AbstractText", ""), "source": data.get("AbstractURL", ""), "related_topics": [topic.get("Text", "") for topic in data.get("RelatedTopics", [])[:5] if isinstance(topic, dict)]}