from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
class SupportTicketCreate(BaseModel):
    subject: str = Field(min_length=3,max_length=255)
    description: str = Field(min_length=3,max_length=10000)
    order_id: int | None = None
    priority: str = "normal"
class SupportTicketUpdate(BaseModel):
    status: str | None = None; priority: str | None = None; assigned_user_id: int | None = None; resolution: str | None = None
class SupportTicketRead(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int; user_id:int; customer_id:int|None; order_id:int|None; subject:str; description:str; priority:str; status:str; assigned_user_id:int|None; resolution:str|None; created_at:datetime; updated_at:datetime
