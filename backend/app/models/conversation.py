from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SendMessageOut(BaseModel):
    messageid: int
    senderid: int
    message_content: str
    timestamp: datetime


class OpenConversationOut(BaseModel):
    conversationid: Optional[int] = None
    friend_user_id: Optional[int] = None
    friend_name: Optional[str] = None
    messages: List[SendMessageOut] = []


class ConversationPreviewOut(BaseModel):
    conversationid: int
    friend_user_id: int
    friend_name: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    last_messaged: datetime


class GetAllConversationsOut(BaseModel):
    conversations: List[ConversationPreviewOut] = []