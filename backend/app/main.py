from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.db import engine, Base
from app.api.routers import feed_router, profile_router, conversations_router, settings_router


app = FastAPI(title="NAME PLACEHOLDER")


@app.on_event("startup")
async def on_startup():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # quick sanity ping
        await conn.execute(text("SELECT 1"))


@app.get("/")
async def start_page():
    return {
        "app": settings.app_name,
        "routes": [
            "GET /feed/",
            "GET /feed-friends/?viewer_id=...",
            "GET /feed-events/",
            "POST /profile/onboarding/",
            "GET /profile/info/?user_id=...",
            "POST /profile/post/",
            "GET /conversations/?user_id=... OR ?conversation_id=...",
            "POST /conversations/{convo_id}/message",
            "GET /settings/",
        ],
    }


# Routers
app.include_router(feed_router)
app.include_router(profile_router)
app.include_router(conversations_router)
app.include_router(settings_router)
