from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class OnboardingIn(BaseModel):
    username: str
    display_name: str
    bio: Optional[str] = None
    onboarding: Dict[str, Any]

class ProfileOut(BaseModel):
    id: str # changed to str to match recs
    username: str
    display_name: str
    bio: Optional[str] = None

class User(ProfileOut):
    RSVP: List[int] = []
