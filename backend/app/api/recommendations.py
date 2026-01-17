"""
recommendation api endpoints

GET /api/recommendations/people?user_id=<id>&limit=20
GET /api/recommendations/posts?user_id=<id>&limit=30
"""

from fastapi import APIRouter, Query, HTTPException

from app.models.recommendation import PersonRecommendation, PostRecommendation
from app.services.recommender_service import recommend_people, recommend_posts, recommend_mixed_feed, refresh_feed


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/refresh")
def refresh_recommendations():
    """
    Refresh user recommendations. This refreshes everyone for now LOL
    """
    return refresh_feed()

@router.get("/all-recs")
def get_all_recommendations(
    user_id: str = Query(..., description="user id to get recommendations for"),
    limit: int = Query(default=20, ge=1, le=50, description="max number of results")):
    """
    Get reranked list of recs from user
    """
    return recommend_mixed_feed(int(user_id), limit)

@router.get("/people", response_model=list[PersonRecommendation])
async def get_people_recommendations(
    user_id: str = Query(..., description="user id to get recommendations for"),
    limit: int = Query(default=20, ge=1, le=50, description="max number of results")
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
    results = recommend_people(int(user_id), limit=limit)
    return results


@router.get("/posts", response_model=list[PostRecommendation])
async def get_post_recommendations(
    user_id: str = Query(..., description="user id to get recommendations for"),
    limit: int = Query(default=30, ge=1, le=50, description="max number of results")
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
    results = recommend_posts(int(user_id), limit=limit)
    return results
