from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.tool_call import ToolCall
from app.models.user import User
from app.schemas.tool import ToolCallRead, ToolDefinition, ToolInvokeRequest
from app.tools.base_tool import ToolContext
from app.tools.registry import ToolNotFoundError, tool_registry

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/tools", response_model=list[ToolDefinition])
def list_tools(user: User = Depends(get_current_active_user)) -> list[dict]:
    return tool_registry.list_definitions()


@router.post("/tools/{tool_name}", response_model=ToolCallRead)
async def invoke_tool(
    tool_name: str,
    payload: ToolInvokeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> ToolCall:
    try:
        tool = tool_registry.get(tool_name)
    except ToolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {tool_name}") from exc

    call = ToolCall(user_id=user.id, tool_name=tool.name, arguments=payload.arguments, status="running")
    db.add(call)
    db.commit()
    db.refresh(call)
    try:
        call.result = await tool.execute(payload.arguments, ToolContext(user_id=user.id, db=db))
        call.status = "succeeded"
    except Exception as exc:
        call.status = "failed"
        call.error = str(exc)
    call.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(call)
    return call


@router.get("/tool-calls", response_model=list[ToolCallRead])
def list_tool_calls(
    db: Session = Depends(get_db), user: User = Depends(get_current_active_user)
) -> list[ToolCall]:
    return db.query(ToolCall).filter(ToolCall.user_id == user.id).order_by(ToolCall.created_at.desc()).limit(100).all()