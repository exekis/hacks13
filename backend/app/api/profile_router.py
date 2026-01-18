
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from jose import JWTError, jwt
import psycopg2
import os
from typing import List, Optional, Dict, Any

from ..schemas.profile import ProfileOut
from ..schemas.post import CreatePostIn, PostOut

from .auth import oauth2_scheme, SECRET_KEY, ALGORITHM, get_db_connection, TokenData

router = APIRouter(prefix="/profile", tags=["profile"])

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
    languages: Optional[List[str]]
    hometown: Optional[str] = None
    agePreference: Optional[AgePreference]
    verifiedStudentsOnly: Optional[bool]
    culturalIdentity: Optional[List[str]] = None
    ethnicity: Optional[List[str]]
    religion: Optional[List[str]] = None
    culturalSimilarityImportance: Optional[int]
    culturalComfortLevel: Optional[str]
    languageMatchImportant: Optional[bool]
    purposeOfStay: Optional[str]
    lookingFor: Optional[List[str]]
    socialVibe: Optional[List[str]]
    availability: Optional[List[str]]
    whocanseeposts: Optional[str]
    hideLocationUntilFriends: Optional[bool]
    meetupPreference: Optional[str]
    boundaries: Optional[str] = None
    bio: Optional[str]
    interests: Optional[List[str]]
    badges: Optional[List[str]]
    matchFilters: Optional[MatchFilters]
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
        "culturalIdentity": user[12] if user[12] is not None else [],
        "ethnicity": [user[13]] if user[13] is not None else [],
        "religion": [user[14]] if user[14] is not None else [],
        "culturalSimilarityImportance": user[15],
        "culturalComfortLevel": user[16],
        "languageMatchImportant": user[17],
        "purposeOfStay": user[18],
        "lookingFor": user[19],
        "socialVibe": user[20],
        "whocanseeposts": user[21],
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

@router.get("/info/", response_model=ProfileOut)
async def profile_info(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT userID, Name, bio FROM Users WHERE userID = %s", (user_id,))
    profile = cur.fetchone()
    cur.close()
    conn.close()
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    return ProfileOut(id=str(profile[0]), username=profile[1], display_name=profile[1], bio=profile[2])


@router.post("/post/", response_model=PostOut)
async def create_post(payload: CreatePostIn):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Users WHERE userID = %s", (payload.author_id,))
    author = cur.fetchone()
    if not author:
        raise HTTPException(status_code=404, detail="author not found")

    # get next post id since postid doesn't auto-increment
    cur.execute("SELECT COALESCE(MAX(PostID), 0) + 1 FROM Posts")
    next_post_id = cur.fetchone()[0]

    cur.execute(
        "INSERT INTO Posts (PostID, user_id, post_content) VALUES (%s, %s, %s) RETURNING PostID, user_id, post_content",
        (next_post_id, payload.author_id, payload.content)
    )
    post = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return PostOut(id=str(post[0]), author_id=str(post[1]), content=post[2] or "", is_event=payload.is_event)


@router.get("/posts/{user_id}", response_model=list[PostOut])
async def get_user_posts(user_id: int):
    """get all posts by a specific user"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT PostID, user_id, post_content FROM Posts WHERE user_id = %s ORDER BY time_posted DESC",
        (user_id,)
    )
    posts = cur.fetchall()
    cur.close()
    conn.close()
    return [
        PostOut(id=str(p[0]), author_id=str(p[1]), content=p[2] or "", is_event=False)
        for p in posts
    ]
