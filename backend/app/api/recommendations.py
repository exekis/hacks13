"""
recommendation api endpoints

GET /api/recommendations/people?user_id=<id>&limit=20
GET /api/recommendations/posts?user_id=<id>&limit=30
"""

from fastapi import APIRouter, Query, HTTPException

from app.models.recommendation import PersonRecommendation, PostRecommendation
from backend.app.services.recommender import recommend_people, recommend_posts
from app.data.demo import get_demo_state


router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/people", response_model=list[PersonRecommendation])
async def get_people_recommendations(
    user_id: str = Query(..., description="user id to get recommendations for"),
    limit: int = Query(default=20, ge=1, le=100, description="max number of results"),
    debug: bool = Query(default=False, description="include debug scores in response"),
):
    """
    get people recommendations for a user
    
    returns a list of recommended profiles based on:
    - friends of friends
    - same city or destination
    - shared goals, languages, and cultural backgrounds
    
    results are ranked by a deterministic scoring algorithm
    and diversified to avoid monoculture clumping
    """
    state = get_demo_state()
    
    if user_id not in state["users"]:
        raise HTTPException(status_code=404, detail=f"user {user_id} not found")
    
    results = recommend_people(user_id, limit=limit, debug=debug)
    return results


@router.get("/posts", response_model=list[PostRecommendation])
async def get_post_recommendations(
    user_id: str = Query(..., description="user id to get recommendations for"),
    limit: int = Query(default=30, ge=1, le=100, description="max number of results"),
    debug: bool = Query(default=False, description="include debug scores in response"),
):
    """
    get post recommendations for a user
    
    returns a list of recommended posts based on:
    - posts by friends
    - posts liked by friends
    - posts by friends-of-friends in same location
    
    results are ranked by a deterministic scoring algorithm
    and diversified to avoid too many posts from the same author
    """
    state = get_demo_state()
    
    if user_id not in state["users"]:
        raise HTTPException(status_code=404, detail=f"user {user_id} not found")
    
    results = recommend_posts(user_id, limit=limit, debug=debug)
    return results
