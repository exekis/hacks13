import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models import UserProfile, Post
from app.schemas.profile import OnboardingIn, ProfileOut
from app.schemas.post import CreatePostIn, PostOut

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("/onboarding/", response_model=ProfileOut)
async def onboarding(payload: OnboardingIn, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(UserProfile).where(UserProfile.username == payload.username))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="username already exists")

    profile = UserProfile(
        username=payload.username,
        display_name=payload.display_name,
        bio=payload.bio,
        onboarding_data=json.dumps(payload.onboarding),
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/info/", response_model=ProfileOut)
async def profile_info(user_id: int, db: AsyncSession = Depends(get_db)):
    profile = (await db.execute(select(UserProfile).where(UserProfile.id == user_id))).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    return profile


@router.post("/post/", response_model=PostOut)
async def create_post(payload: CreatePostIn, db: AsyncSession = Depends(get_db)):
    author = (await db.execute(select(UserProfile).where(UserProfile.id == payload.author_id))).scalar_one_or_none()
    if not author:
        raise HTTPException(status_code=404, detail="author not found")

    post = Post(author_id=payload.author_id, content=payload.content, is_event=payload.is_event)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post
