from fastapi import APIRouter, Depends, HTTPException

# from app.api.deps import get_db
# from app.models import Conversation
from app.schemas.conversation import CreateMessageIn, MessageOut
from app.services.conversation_service import list_conversations_with_messages, add_message

router = APIRouter(prefix="", tags=["dms"])


@router.get("/conversations/")
async def conversations(
    user_id: int | None = None,
    conversation_id: int | None = None,
    # db: AsyncSession = Depends(get_db),
):
    db = None # Mock db
    # "Can either be by userid or by conversationid"
    return await list_conversations_with_messages(db, user_id=user_id, conversation_id=conversation_id)

@router.post("/conversations/{convo_id}/message", response_model=MessageOut)
async def post_message(convo_id: int, payload: CreateMessageIn):
    # Mock implementation without DB
    db = None
    # convo = (await db.execute(select(Conversation).where(Conversation.id == convo_id))).scalar_one_or_none()
    # if not convo:
    #    raise HTTPException(status_code=404, detail="conversation not found")
    
    # Mock add_message call
    # msg = await add_message(db, conversation_id=convo_id, sender_id=payload.sender_id, body=payload.body)
    from datetime import datetime
    return MessageOut(
        id=999,
        sender_id=1,
        recipient_id=2, # dummy
        content=payload.content,
        created_at=datetime.now()
    )
