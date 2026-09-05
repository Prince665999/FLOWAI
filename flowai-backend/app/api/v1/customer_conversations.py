from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies import require_customer_dep
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.conversation import ConversationCreate,ConversationRead
router=APIRouter(prefix="/customer/conversations",tags=["customer-conversations"])
@router.get("",response_model=list[ConversationRead])
def list_conversations(db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):return db.query(Conversation).filter_by(user_id=user.id).order_by(Conversation.updated_at.desc()).all()
@router.post("",response_model=ConversationRead,status_code=201)
def create_conversation(payload:ConversationCreate,db:Session=Depends(get_db),user:User=Depends(require_customer_dep)):
 conversation=Conversation(user_id=user.id,title=payload.title);db.add(conversation);db.commit();db.refresh(conversation);return conversation
