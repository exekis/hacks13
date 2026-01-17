from __future__ import annotations

from typing import Optional, Any, Dict, List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from app.models.conversation import ConversationPreviewOut, SendMessageOut, OpenConversationOut
from app.services.conversations_service import (
    get_conversations,
    send_message,
    open_conversation,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])

class SendMessageRequest(BaseModel):
    user_id: int = Field(..., description="Sender user id")
    friend_id: int = Field(..., description="Recipient friend user id")
    message_content: str = Field(..., min_length=1, description="Message text")


@router.get(
    "/all-conversations",
    response_model=List[ConversationPreviewOut],
)
def all_conversations(
    user_id: int = Query(..., description="User id to fetch conversations for"),
) -> List[ConversationPreviewOut]:
    """
    GET /conversations/all-conversations?user_id=123
    """
    try:
        rows = get_conversations(user_id)
        # rows is already a list[dict] from RealDictCursor; response_model will validate/serialize
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/send-message",
    response_model=SendMessageOut,
)
def post_send_message(payload: SendMessageRequest) -> SendMessageOut:
    """
    POST /conversations/send-message
    """
    try:
        row = send_message(
            user_id=payload.user_id,
            friend_id=payload.friend_id,
            message_content=payload.message_content,
        )
        return row
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/conversation/{friend_user_id}",
    response_model=OpenConversationOut,
)
def get_conversation(
    friend_user_id: int,
    user_id: int = Query(..., description="Current user id"),
) -> OpenConversationOut:
    """
    GET /conversations/conversation/{friend_user_id}?user_id=123
    """
    try:
        return open_conversation(user_id=user_id, friend_id=friend_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/conversation",
    response_model=OpenConversationOut,
)
def get_most_recent_conversation(
    user_id: int = Query(..., description="Current user id"),
) -> OpenConversationOut:
    """
    GET /conversations/conversation?user_id=123
    Opens the most recent conversation (by Conversations.last_messaged).
    """
    try:
        return open_conversation(user_id=user_id, friend_id=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))