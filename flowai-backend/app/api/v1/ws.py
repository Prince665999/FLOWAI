import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.ai.llm_client import LLMConfigurationError, llm_client
from app.db.session import SessionLocal
from app.models.conversation import Conversation
from app.models.message import Message
from app.websockets.manager import connection_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/conversations/{conversation_id}")
async def conversation_websocket(websocket: WebSocket, conversation_id: int) -> None:
    db: Session = SessionLocal()
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation is None:
        await websocket.close(code=1008, reason="Conversation not found")
        db.close()
        return

    await connection_manager.connect(websocket, conversation_id)
    try:
        while True:
            content = await websocket.receive_text()
            db.add(Message(conversation_id=conversation_id, role="user", content=content))
            db.commit()
            history = [
                {"role": message.role, "content": message.content}
                for message in db.query(Message)
                .filter(Message.conversation_id == conversation_id)
                .order_by(Message.created_at)
                .all()
                if message.role in {"user", "assistant", "system"}
            ]
            messages = [
                {
                    "role": "system",
                    "content": "You are FLOWAI, an AI business operations assistant. Be concise, practical, and do not invent business data or completed actions.",
                },
                *history,
            ]
            assistant_content = ""
            try:
                async for token in llm_client.stream(messages):
                    assistant_content += token
                    await connection_manager.broadcast(
                        conversation_id, json.dumps({"type": "token", "content": token})
                    )
                if assistant_content:
                    db.add(Message(conversation_id=conversation_id, role="assistant", content=assistant_content))
                    db.commit()
                await connection_manager.broadcast(conversation_id, json.dumps({"type": "done"}))
            except LLMConfigurationError as exc:
                await websocket.send_json({"type": "error", "detail": str(exc)})
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, conversation_id)
    finally:
        db.close()


@router.websocket("/ws/events/{user_id}")
async def user_events_websocket(websocket: WebSocket, user_id: int) -> None:
    """User-level real-time events channel for approvals, notifications, and workflow status."""
    await connection_manager.connect_user(websocket, user_id)
    try:
        while True:
            # Keep connection alive with heartbeat / client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "pong"}))
    except WebSocketDisconnect:
        connection_manager.disconnect_user(websocket, user_id)