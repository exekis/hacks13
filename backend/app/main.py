"""
Travelmate backend API

Merged FastAPI application:
- Core app endpoints (feed/profile/conversations/settings)
- Recommendations endpoints (existing router)
- Auth and Profile setup endpoints
- CORS + health check preserved
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# IMPORTANT: import the APIRouter objects, not the modules
from app.api.conversations import router as conversations_router
from app.api.settings import router as settings_router
from app.api.profile import router as profile_router
from app.api.recommendations import router as recommendations_router
from app.api import auth, profile_setup


app = FastAPI(title="Travelmate API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"ok": True}


@app.get("/")
async def root():
    return {
        "app": "Travelmate API",
        "version": "1.0.0",
        "endpoints": [
            "POST /profile/onboarding/",
            "GET /profile/info/?user_id=...",
            "POST /profile/post/",
            "GET /conversations/?user_id=... OR ?conversation_id=...",
            "POST /conversations/{convo_id}/message",
            "POST /conversations/send-message",
            "GET /conversations/all-conversations?user_id=123",
            "GET /conversations/conversation/{friend_user_id}?user_id=123",
            "GET /conversations/conversation?user_id=123",
            "GET /settings/",
            "GET /api/health",
            "GET /api/recommendations/people?user_id=<id>&limit=20",
            "GET /api/recommendations/posts?user_id=<id>&limit=20",
        ],
    }


# Routers (note: these are APIRouter objects)
app.include_router(auth.router)
app.include_router(profile_setup.router)
app.include_router(conversations_router)
app.include_router(settings_router)
app.include_router(recommendations_router, prefix="/api")
app.include_router(profile_router)
