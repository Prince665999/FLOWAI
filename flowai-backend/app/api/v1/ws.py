import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ai.llm_client import LLMConfigurationError, llm_client
from app.websockets.manager import connection_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/conversations/{conversation_id}")
async def conversation_websocket(websocket: WebSocket, conversation_id: int) -> None:
    await connection_manager.connect(websocket, conversation_id)
    try:
        while True:
            content = await websocket.receive_text()
            messages = [
                {
                    "role": "system",
                    "content": "You are FLOWAI, an AI business operations assistant. Be concise and do not invent business data.",
                },
                {"role": "user", "content": content},
            ]
            try:
                async for token in llm_client.stream(messages):
                    await connection_manager.broadcast(
                        conversation_id, json.dumps({"type": "token", "content": token})
                    )
                await connection_manager.broadcast(conversation_id, json.dumps({"type": "done"}))
            except LLMConfigurationError as exc:
                await websocket.send_json({"type": "error", "detail": str(exc)})
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, conversation_id)