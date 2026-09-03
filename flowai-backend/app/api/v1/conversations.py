from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.ai.llm_client import LLMConfigurationError, llm_client
from app.ai.prompts.business_context import build_business_context_prompt
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.conversation import ConversationCreate, ConversationRead, MessageCreate

router = APIRouter(prefix="/conversations", tags=["conversations"])


def get_owned_conversation(conversation_id: int, user: User, db: Session) -> Conversation:
    conversation = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(Conversation.id == conversation_id, Conversation.user_id == user.id)
        .first()
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("", response_model=list[ConversationRead])
def list_conversations(
    db: Session = Depends(get_db), user: User = Depends(get_current_active_user)
) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Conversation:
    conversation = Conversation(user_id=user.id, title=payload.title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/{conversation_id}", response_model=ConversationRead)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Conversation:
    return get_owned_conversation(conversation_id, user, db)


@router.post("/{conversation_id}/messages")
async def stream_message(
    conversation_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> StreamingResponse:
    conversation = get_owned_conversation(conversation_id, user, db)
    user_message = Message(conversation_id=conversation.id, role="user", content=payload.content)
    db.add(user_message)
    db.commit()
    history = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
        if message.role in {"user", "assistant", "system"}
    ]
    messages = [{"role": "system", "content": build_business_context_prompt(user)}, *history, {"role": "user", "content": payload.content}]

    async def generate() -> AsyncIterator[str]:
        assistant_content = ""
        try:
            async for token in llm_client.stream(messages):
                assistant_content += token
                yield token
        except LLMConfigurationError as exc:
            yield f"\n[LLM configuration error: {exc}]"
        if assistant_content:
            db.add(Message(conversation_id=conversation.id, role="assistant", content=assistant_content))
            db.commit()

    return StreamingResponse(generate(), media_type="text/plain")