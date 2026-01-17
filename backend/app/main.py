"""
Travelmate backend API

Merged FastAPI application:
- Core app endpoints (feed/profile/conversations/settings)
- Recommendations endpoints (existing router)
- CORS + health check preserved
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORTANT: import the APIRouter objects, not the modules
from app.api.conversations import router as conversations_router
# from app.api.profile_router import router as profile_router
from app.api.settings import router as settings_router
from app.api.recommendations import router as recommendations_router  # adjust path if needed

app = FastAPI(title="Travelmate API")

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
            
            # send message request
            "POST /conversations/send-message",
            # all conversations
            "GET /conversations/all-conversations?user_id=123",
            # specific conversation with friend
            "GET /conversations/conversation/{friend_user_id}?user_id=123",
            # most recent conversation
            "GET /conversations/conversation?user_id=123",

            "GET /settings/",
            "GET /api/health",
            "GET /api/recommendations/people?user_id=<id>&limit=20",
            "GET /api/recommendations/posts?user_id=<id>&limit=20",
        ],
    }


# Routers (note: these are APIRouter objects)
app.include_router(conversations_router)
#app.include_router(profile_router)
app.include_router(settings_router)
app.include_router(recommendations_router, prefix="/api")