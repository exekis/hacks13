from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.feed import FeedCard
from app.services.feed_service import build_feed_cards

router = APIRouter(prefix="", tags=["feed"])


@router.get("/feed/", response_model=list[FeedCard])
async def feed(
    viewer_id: int | None = Query(default=None, description="Used for friend-filter placeholder logic"),
    db: AsyncSession = Depends(get_db),
):
    return await build_feed_cards(db, viewer_id=viewer_id)


@router.get("/feed-friends/", response_model=list[FeedCard])
async def feed_friends(
    viewer_id: int = Query(..., description="viewer_id is required to filter by 'friends' (placeholder)"),
    db: AsyncSession = Depends(get_db),
):
    return await build_feed_cards(db, only_friends=True, viewer_id=viewer_id)


@router.get("/feed-events/", response_model=list[FeedCard])
async def feed_events(
    viewer_id: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await build_feed_cards(db, only_events=True, viewer_id=viewer_id)
