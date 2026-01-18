from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from jose import JWTError, jwt
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import List, Optional

from .auth import oauth2_scheme, SECRET_KEY, ALGORITHM, get_db_connection, TokenData

router = APIRouter()

class AgePreference(BaseModel):
    enabled: bool = True
    range: int = 25

class MatchFilters(BaseModel):
    ageRange: List[int] = [18, 99]
    sharedGoals: List[str] = []
    languages: List[str] = []
    verifiedOnly: bool = False
    culturalSimilarity: int = 50

class UserProfile(BaseModel):
    fullName: Optional[str] = None
    age: Optional[int] = None
    pronouns: Optional[str] = None
    isStudent: Optional[bool] = None
    university: Optional[str] = None
    currentCity: Optional[str] = None
    travelingTo: Optional[str] = None
    languages: List[str] = []
    hometown: Optional[str] = None
    agePreference: AgePreference = AgePreference()
    verifiedStudentsOnly: bool = False
    culturalIdentity: List[str] = []
    ethnicity: List[str] = []
    religion: List[str] = []
    culturalSimilarityImportance: int = 50
    culturalComfortLevel: str = "open"
    languageMatchImportant: bool = False
    purposeOfStay: Optional[str] = None
    lookingFor: List[str] = []
    socialVibe: List[str] = []
    availability: List[str] = []
    whoCanSeePosts: str = "everyone"
    hideLocationUntilFriends: bool = True
    meetupPreference: str = "public-first"
    boundaries: Optional[str] = None
    bio: str = ""
    interests: List[str] = []
    badges: List[str] = []
    matchFilters: MatchFilters = MatchFilters()
    AboutMe: Optional[str] = None
    Friends: List[int] = []
    recs: List[dict] = []
    event_recs: List[dict] = []
    # flag to indicate if profile setup is complete
    profileComplete: bool = False

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM Users WHERE Email = %s", (token_data.email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user is None:
        raise credentials_exception
    
    # check if profile setup is complete (has required fields filled)
    profile_complete = bool(
        user.get("name") and 
        user.get("currentcity") and 
        user.get("bio")
    )
    
    # construct userprofile from database row with safe defaults
    user_dict = {
        "fullName": user.get("name") or "",
        "age": user.get("age") or 18,
        "pronouns": user.get("pronouns"),
        "isStudent": user.get("isstudent") if user.get("isstudent") is not None else False,
        "university": user.get("university"),
        "currentCity": user.get("currentcity") or "",
        "travelingTo": user.get("travelingto"),
        "languages": user.get("languages") or [],
        "hometown": user.get("hometown"),
        "agePreference": {"enabled": True, "range": user.get("agepreference") or 25},
        "verifiedStudentsOnly": user.get("verifiedstudentsonly") if user.get("verifiedstudentsonly") is not None else False,
        "culturalIdentity": user.get("culturalidentity") or [],
        "ethnicity": [user.get("ethnicity")] if user.get("ethnicity") else [],
        "religion": [user.get("religion")] if user.get("religion") else [],
        "culturalSimilarityImportance": user.get("culturalsimilarityimportance") or 50,
        "culturalComfortLevel": user.get("culturalcomfortlevel") or "open",
        "languageMatchImportant": user.get("languagematchimportant") if user.get("languagematchimportant") is not None else False,
        "purposeOfStay": user.get("purposeofstay") or "",
        "lookingFor": user.get("lookingfor") or [],
        "socialVibe": user.get("socialvibe") or [],
        "whoCanSeePosts": user.get("whocanseeposts") or "everyone",
        "hideLocationUntilFriends": user.get("hidelocationuntilfriends") if user.get("hidelocationuntilfriends") is not None else True,
        "meetupPreference": user.get("meetuppreference") or "public-first",
        "boundaries": user.get("boundaries") or "",
        "bio": user.get("bio") or "",
        "AboutMe": user.get("aboutme") or "",
        "Friends": user.get("friends") or [],
        "recs": [],
        "event_recs": [],
        "availability": [],
        "interests": [],
        "badges": [],
        "matchFilters": {
            "ageRange": [18, 99],
            "sharedGoals": [],
            "languages": user.get("languages") or [],
            "verifiedOnly": user.get("verifiedstudentsonly") if user.get("verifiedstudentsonly") is not None else False,
            "culturalSimilarity": user.get("culturalsimilarityimportance") or 50
        },
        "profileComplete": profile_complete,
    }
    return UserProfile(**user_dict)


@router.get("/users/me", response_model=UserProfile)
async def read_users_me(current_user: UserProfile = Depends(get_current_user)):
    return current_user
