from __future__ import annotations

from typing import Optional, Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

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


@router.get("/all-conversations")
def all_conversations(user_id: int) -> List[Dict[str, Any]]:
    """
    GET /conversations/all-conversations?user_id=123

    Returns a list of conversations for user_id, including:
    - friend_user_id, friend_name
    - last_message, last_message_time
    - last_messaged
    """
    try:
        return get_conversations(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-message")
def post_send_message(payload: SendMessageRequest) -> Dict[str, Any]:
    """
    POST /conversations/send-message

    Body:
    {
      "user_id": 123,
      "friend_id": 456,
      "message_content": "hi!"
    }

    Inserts a message and returns the inserted message row.
    """
    try:
        return send_message(
            user_id=payload.user_id,
            friend_id=payload.friend_id,
            message_content=payload.message_content,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversation/{friend_user_id}")
def get_conversation(friend_user_id: int, user_id: int) -> Dict[str, Any]:
    """
    GET /conversations/conversation/{friend_user_id}?user_id=123

    Returns:
    {
      "conversationID": ...,
      "friend_user_id": ...,
      "friend_name": ...,
      "messages": [...]
    }
    """
    try:
        return open_conversation(user_id=user_id, friend_id=friend_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversation")
def get_most_recent_conversation(user_id: int) -> Dict[str, Any]:
    """
    GET /conversations/conversation?user_id=123

    Opens the most recent conversation (by Conversations.last_messaged).
    """
    try:
        return open_conversation(user_id=user_id, friend_id=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
