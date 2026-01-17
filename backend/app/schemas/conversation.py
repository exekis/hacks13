from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CreateMessageIn(BaseModel):
    recipient_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    content: str
    created_at: datetime
