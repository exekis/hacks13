from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from jose import JWTError, jwt
import psycopg2
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
    ethnicity: List[str]
    religion: Optional[List[str]] = None
    culturalSimilarityImportance: int
    culturalComfortLevel: str
    languageMatchImportant: bool
    purposeOfStay: str
    lookingFor: List[str]
    socialVibe: List[str]
    availability: List[str]
    whoCanMessage: str
    whoCanSeePosts: str
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
    cur = conn.cursor()
    cur.execute("SELECT * FROM Users WHERE Email = %s", (token_data.email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user is None:
        raise credentials_exception
    
    # Convert tuple to dictionary and construct UserProfile
    user_dict = {
        "fullName": user[1],
        "age": user[2],
        "pronouns": user[4],
        "isStudent": user[5],
        "university": user[6],
        "currentCity": user[7],
        "languages": user[8],
        "hometown": user[9],
        "agePreference": {"enabled": True, "range": user[10]},
        "verifiedStudentsOnly": user[11],
        "culturalIdentity": user[12],
        "ethnicity": [user[13]],
        "religion": [user[14]],
        "culturalSimilarityImportance": user[15],
        "culturalComfortLevel": user[16],
        "languageMatchImportant": user[17],
        "purposeOfStay": user[18],
        "lookingFor": user[19],
        "socialVibe": user[20],
        "whoCanSeePosts": user[21],
        "hideLocationUntilFriends": user[22],
        "meetupPreference": user[23],
        "boundaries": user[24],
        "bio": user[25],
        "AboutMe": user[26],
        "Friends": user[27],
        "recs": user[28],
        "event_recs": user[29],
        "travelingTo": None,
        "availability": [],
        "whoCanMessage": "anyone-verified",
        "interests": [],
        "badges": [],
        "matchFilters": {
            "ageRange": [18, 30],
            "sharedGoals": [],
            "languages": [],
            "verifiedOnly": False,
            "culturalSimilarity": 50
        }
    }
    return UserProfile(**user_dict)


@router.get("/users/me", response_model=UserProfile)
async def read_users_me(current_user: UserProfile = Depends(get_current_user)):
    return current_user
