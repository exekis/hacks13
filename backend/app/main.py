from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

# from app.core.config import settings
# from app.core.db import engine, Base
from app.api import profile
from app.api import profile_setup
from app.api import conversations
from app.api import settings
from app.api import recommendations
from app.api import auth


app = FastAPI(title="NAME PLACEHOLDER")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.on_event("startup")
# async def on_startup():
#     # Create tables
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#         # quick sanity ping
#         await conn.execute(text("SELECT 1"))


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
app.include_router(profile.router)
app.include_router(profile_setup.router)
# app.include_router(conversations.router)
# app.include_router(settings.router)
# app.include_router(recommendations.router)
app.include_router(auth.router)
