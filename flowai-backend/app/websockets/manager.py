from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, conversation_id: int) -> None:
        await websocket.accept()
        self.active_connections[conversation_id].add(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: int) -> None:
        self.active_connections[conversation_id].discard(websocket)
        if not self.active_connections[conversation_id]:
            del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: int, message: str) -> None:
        for websocket in tuple(self.active_connections.get(conversation_id, ())):
            await websocket.send_text(message)


connection_manager = ConnectionManager()