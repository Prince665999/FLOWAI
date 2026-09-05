from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
class ReviewCreate(BaseModel):
    product_id:int; order_id:int; rating:int=Field(ge=1,le=5); title:str=Field(min_length=2,max_length=160); body:str=Field(min_length=2,max_length=5000)
class ReviewRead(ReviewCreate):
    model_config=ConfigDict(from_attributes=True)
    id:int; user_id:int; status:str; created_at:datetime
