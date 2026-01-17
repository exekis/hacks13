from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# from app.api.deps import get_db
# from app.models import Conversation
# from app.schemas.conversation import CreateMessageIn, MessageOut
# from app.services.conversation_service import list_conversations_with_messages, add_message

# router = APIRouter(prefix="", tags=["dms"])


# @router.get("/conversations/")
# async def conversations(
#     user_id: int | None = None,
#     conversation_id: int | None = None,
#     db: AsyncSession = Depends(get_db),
# ):
#     # "Can either be by userid or by conversationid"
#     return await list_conversations_with_messages(db, user_id=user_id, conversation_id=conversation_id)


# @router.post("/conversations/{convo_id}/message", response_model=MessageOut)
# async def post_message(convo_id: int, payload: CreateMessageIn, db: AsyncSession = Depends(get_db)):
#     convo = (await db.execute(select(Conversation).where(Conversation.id == convo_id))).scalar_one_or_none()
#     if not convo:
#         raise HTTPException(status_code=404, detail="conversation not found")

#     msg = await add_message(db, conversation_id=convo_id, sender_id=payload.sender_id, body=payload.body)
#     return msg
