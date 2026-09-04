from collections import defaultdict
import json
from typing import Any
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, set[WebSocket]] = defaultdict(set)
        self.user_connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, conversation_id: int) -> None:
        await websocket.accept()
        self.active_connections[conversation_id].add(websocket)

    async def connect_user(self, websocket: WebSocket, user_id: int) -> None:
        await websocket.accept()
        self.user_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: int) -> None:
        self.active_connections[conversation_id].discard(websocket)
        if not self.active_connections[conversation_id]:
            self.active_connections.pop(conversation_id, None)

    def disconnect_user(self, websocket: WebSocket, user_id: int) -> None:
        self.user_connections[user_id].discard(websocket)
        if not self.user_connections[user_id]:
            self.user_connections.pop(user_id, None)

    async def broadcast(self, conversation_id: int, message: str) -> None:
        for websocket in tuple(self.active_connections.get(conversation_id, ())):
            try:
                await websocket.send_text(message)
            except Exception:
                self.disconnect(websocket, conversation_id)

    async def broadcast_to_user(self, user_id: int, event_type: str, data: dict[str, Any]) -> None:
        payload = json.dumps({"event": event_type, "data": data})
        for websocket in tuple(self.user_connections.get(user_id, ())):
            try:
                await websocket.send_text(payload)
            except Exception:
                self.disconnect_user(websocket, user_id)


connection_manager = ConnectionManager()