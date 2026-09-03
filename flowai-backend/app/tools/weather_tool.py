from typing import Any

import httpx

from app.tools.base_tool import BaseTool, ToolContext


class WeatherTool(BaseTool):
    name = "weather"
    description = "Get current weather for a latitude and longitude."
    permissions = {"weather.read"}
    input_schema = {"type": "object", "properties": {"latitude": {"type": "number"}, "longitude": {"type": "number"}}, "required": ["latitude", "longitude"]}

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("https://api.open-meteo.com/v1/forecast", params={"latitude": arguments["latitude"], "longitude": arguments["longitude"], "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"})
            response.raise_for_status()
        return response.json()