from app.schemas.conversation import MessageOut
from datetime import datetime

async def list_conversations_with_messages(db, user_id=None, conversation_id=None):
    # Mock implementation
    return [
        {
            "id": 1,
            "participants": [user_id or 1, 2],
            "messages": [
                MessageOut(id=1, sender_id=2, recipient_id=user_id or 1, content="Hello!", created_at=datetime.now())
            ]
        }
    ]

async def add_message(db, payload):
    return MessageOut(
        id=2,
        sender_id=1,
        recipient_id=payload.recipient_id,
        content=payload.content,
        created_at=datetime.now()
    )
