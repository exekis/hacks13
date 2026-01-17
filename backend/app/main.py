"""
Travelmate backend API

Merged FastAPI application:
- Core app endpoints (feed/profile/conversations/settings)
- Recommendations endpoints (existing router)
- CORS + health check preserved
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import routers
from app.api import (
    settings_router
)
from app.api import conversations_router, profile_router, recommendations_router, settings_router


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
    """Health check endpoint."""
    return {"ok": True}


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "app": settings_router.app_name if hasattr(settings_router, "app_name") else "Travelmate API",
        "version": getattr(settings_router, "version", "1.0.0"),
        "endpoints": [
            "POST /profile/onboarding/",
            "GET /profile/info/?user_id=...",
            "POST /profile/post/",
            "GET /conversations/?user_id=... OR ?conversation_id=...",
            "POST /conversations/{convo_id}/message",
            "GET /settings/",

            # recommendations endpoints
            "GET /api/health",
            "GET /api/recommendations/people?user_id=<id>&limit=20",
            "GET /api/recommendations/posts?user_id=<id>&limit=20",
        ],
    }


# Routers
app.include_router(conversations_router)
app.include_router(profile_router)
app.include_router(recommendations_router, prefix="api")
app.include_router(settings_router)
