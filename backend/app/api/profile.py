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
    enabled: bool
    range: int

class MatchFilters(BaseModel):
    ageRange: List[int]
    sharedGoals: List[str]
    languages: List[str]
    verifiedOnly: bool
    culturalSimilarity: int

class UserProfile(BaseModel):
    fullName: str
    age: int
    pronouns: Optional[str] = None
    isStudent: bool
    university: Optional[str] = None
    currentCity: str
    travelingTo: Optional[str] = None
    languages: List[str]
    hometown: Optional[str] = None
    agePreference: AgePreference
    verifiedStudentsOnly: bool
    culturalIdentity: Optional[List[str]] = None
    ethnicity: Optional[List[str]] = None
    religion: Optional[List[str]] = None
    culturalSimilarityImportance: int
    culturalComfortLevel: str
    languageMatchImportant: bool
    purposeOfStay: Optional[str] = None
    lookingFor: List[str]
    socialVibe: List[str]
    availability: List[str]
    whocanseeposts: str
    hideLocationUntilFriends: bool
    meetupPreference: str
    boundaries: Optional[str] = None
    bio: str
    interests: List[str]
    badges: List[str]
    matchFilters: MatchFilters
    AboutMe: Optional[str] = None
    Friends: Optional[List[int]] = None
    recs: Optional[List[dict]] = None
    event_recs: Optional[List[dict]] = None

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
    
    # construct userprofile from database row
    user_dict = {
        "fullName": user.get("name", "Unknown"),
        "age": user.get("age", 18),
        "pronouns": user.get("pronouns"),
        "isStudent": user.get("isstudent", False),
        "university": user.get("university"),
        "currentCity": user.get("currentcity", ""),
        "travelingTo": user.get("travelingto"),
        "languages": user.get("languages", []),
        "hometown": user.get("hometown"),
        "agePreference": {"enabled": True, "range": user.get("agepreference", 25)},
        "verifiedStudentsOnly": user.get("verifiedstudentsonly", False),
        "culturalIdentity": user.get("culturalidentity", []),
        "ethnicity": [user.get("ethnicity")] if user.get("ethnicity") else [],
        "religion": [user.get("religion")] if user.get("religion") else [],
        "culturalSimilarityImportance": user.get("culturalsimilarityimportance", 50),
        "culturalComfortLevel": user.get("culturalcomfortlevel", ""),
        "languageMatchImportant": user.get("languagematchimportant", False),
        "purposeOfStay": user.get("purposeofstay", ""),
        "lookingFor": user.get("lookingfor", []),
        "socialVibe": user.get("socialvibe", []),
        "whocanseeposts": user.get("whocanseeposts", ""),
        "hideLocationUntilFriends": user.get("hidelocationuntilfriends", False),
        "meetupPreference": user.get("meetuppreference", ""),
        "boundaries": user.get("boundaries", ""),
        "bio": user.get("bio", ""),
        "AboutMe": user.get("aboutme", ""),
        "Friends": user.get("friends", []),
        "recs": [],
        "event_recs": [],
        "availability": [],
        "interests": [],
        "badges": [],
        "matchFilters": {
            "ageRange": [18, 30],
            "sharedGoals": [],
            "languages": user.get("languages", []),
            "verifiedOnly": user.get("verifiedstudentsonly", False),
            "culturalSimilarity": user.get("culturalsimilarityimportance", 50)
        }
    }
    return UserProfile(**user_dict)


@router.get("/users/me", response_model=UserProfile)
async def read_users_me(current_user: UserProfile = Depends(get_current_user)):
    return current_user
