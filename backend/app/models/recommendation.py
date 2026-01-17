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
    """api response shape for person recommendations"""
    
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    bio: str = ""
    verified_student: bool = False
    age_verified: bool = False
    tags: list[str] = Field(default_factory=list)  # up to 6 combined chips
    mutual_friends_count: int = 0
    location_hidden: bool = True
    debug_score: Optional[float] = None


class PostRecommendation(BaseModel):
    """api response shape for post recommendations"""
    
    id: str
    author_id: str
    author_name: str
    author_verified_student: bool = False
    text: str
    image_url: Optional[str] = None
    coarse_location: str
    date_range: Optional[dict] = None  # {start_date, end_date}
    liked_by_friends_count: int = 0
    debug_score: Optional[float] = None
