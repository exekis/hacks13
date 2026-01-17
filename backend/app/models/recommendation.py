"""
pydantic models for the recommendation system

these models are designed to work with in-memory data now
but can easily be adapted to database queries later
"""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """user profile for recommendations"""
    
    id: str
    display_name: str
    age: int
    verified_student: bool = False
    age_verified: bool = False
    current_city: str
    destination_city: Optional[str] = None
    cultural_backgrounds: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    bio: str = ""
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    last_active_at: datetime = Field(default_factory=datetime.now)
    
    # preferences
    prefer_near_age: bool = False
    verified_only: bool = False


class Post(BaseModel):
    """post model for recommendations"""
    
    id: str
    author_id: str
    text: str
    created_at: datetime = Field(default_factory=datetime.now)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    coarse_location: str  # must remain vague, no exact location
    tags: list[str] = Field(default_factory=list)
    image_url: Optional[str] = None


class PersonRecommendation(BaseModel):
    """API response shape for person recommendations"""

    userid: int
    pronouns: Optional[str] = None
    currentCity: Optional[str] = None
    travelingTo: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None


class PostRecommendation(BaseModel):
    """API response shape for post recommendations"""

    postid: int
    time_posted: Optional[str] = None
    post_content: str