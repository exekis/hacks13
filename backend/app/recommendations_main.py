"""
travelmate recommendation api

standalone fastapi application for the recommendation system
designed to run independently and be merged later
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recommendations import router as recommendations_router


app = FastAPI(
    title="Travelmate Recommendations API",
    description="Deterministic, fair recommendation algorithm for Travelmate",
    version="1.0.0",
)

# cors for frontend dev server
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
    """health check endpoint"""
    return {"ok": True}


@app.get("/")
async def root():
    """root endpoint with api info"""
    return {
        "app": "Travelmate Recommendations API",
        "version": "1.0.0",
        "endpoints": [
            "GET /api/health",
            "GET /api/recommendations/people?user_id=<id>&limit=20",
            "GET /api/recommendations/posts?user_id=<id>&limit=30",
        ],
        "demo_users": [
            "user_1", "user_2", "user_3", "user_4", "user_5", "user_6",
            "user_7", "user_8", "user_9", "user_10", "user_11", "user_12",
        ],
    }


# include recommendations router
app.include_router(recommendations_router)
