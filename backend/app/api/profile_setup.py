"""
Profile setup endpoints - for progressively building user profiles during onboarding
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from .auth import get_db_connection, oauth2_scheme, SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

router = APIRouter()


# -----------------------------
# Pydantic models for each step
# -----------------------------
class Step1BasicInfo(BaseModel):
    fullName: str
    age: int
    pronouns: Optional[str] = None
    isStudent: bool
    university: Optional[str] = None
    currentCity: str
    languages: List[str]
    hometown: Optional[str] = None


class Step2CulturalInfo(BaseModel):
    culturalIdentity: List[str]
    ethnicity: Optional[List[str]] = None
    religion: Optional[List[str]] = None
    culturalSimilarityImportance: int
    culturalComfortLevel: str
    languageMatchImportant: bool


class Step3TravelIntent(BaseModel):
    lookingFor: List[str]
    socialVibe: List[str]
    availability: Optional[List[str]] = None  # Not stored in schema (kept for client compatibility)
    purposeOfStay: Optional[str] = None


class Step4SafetyComfort(BaseModel):
    whoCanSeePosts: str
    hideLocationUntilFriends: bool
    meetupPreference: str
    boundaries: Optional[str] = None


class Step5ProfileCustomization(BaseModel):
    bio: str
    interests: List[str]  # Not stored in schema (kept for client compatibility)
    badges: Optional[List[str]] = None  # Not stored in schema (kept for client compatibility)
    AboutMe: Optional[str] = None


class Step6MatchFilters(BaseModel):
    agePreference: Optional[Dict[str, Any]] = None
    verifiedStudentsOnly: bool
    culturalSimilarity: int  # Not stored in schema (kept for client compatibility)


# -----------------------------
# Helpers
# -----------------------------
def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    """Extract email from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception


def get_user_id_by_email(email: str) -> int:
    """Get userID from email"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT userID FROM Users WHERE Email = %s", (email,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return result[0]
    finally:
        cur.close()
        conn.close()


def list_to_csv(value: Optional[List[str]]) -> Optional[str]:
    """
    Schema has ethnicity/religion as VARCHAR(255), but your API sends List[str].
    Convert list -> comma-separated string safely (no schema changes).
    """
    if not value:
        return None
    return ", ".join([v.strip() for v in value if isinstance(v, str) and v.strip()])


# -----------------------------
# Endpoints
# -----------------------------
@router.post("/profile/setup/step1")
async def update_step1(data: Step1BasicInfo, token: str = Depends(oauth2_scheme)):
    """
    Save Step 1: Basic Information
    - fullName, age, pronouns, isStudent, university, currentCity, languages, hometown
    """
    email = get_current_user_email(token)
    user_id = get_user_id_by_email(email)

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE Users SET
                Name = %s,
                Age = %s,
                pronouns = %s,
                isStudent = %s,
                university = %s,
                currentCity = %s,
                languages = %s,
                hometown = %s
            WHERE userID = %s
            """,
            (
                data.fullName,
                data.age,
                data.pronouns,
                data.isStudent,
                data.university,
                data.currentCity,
                data.languages if data.languages else None,  # TEXT[] in schema
                data.hometown,
                user_id,
            ),
        )
        conn.commit()

        # Debug: SELECT and print the updated data
        cur.execute(
            """
            SELECT userID, Name, Age, pronouns, isStudent, university, currentCity, languages, hometown
            FROM Users WHERE userID = %s
            """,
            (user_id,),
        )
        result = cur.fetchone()

        print("\n" + "=" * 60)
        print("STEP 1 DATA SAVED TO DATABASE")
        print("=" * 60)
        print(f"userID: {result[0]}")
        print(f"Name: {result[1]}")
        print(f"Age: {result[2]}")
        print(f"pronouns: {result[3]}")
        print(f"isStudent: {result[4]}")
        print(f"university: {result[5]}")
        print(f"currentCity: {result[6]}")
        print(f"languages: {result[7]}")
        print(f"hometown: {result[8]}")
        print("=" * 60 + "\n")

        return {"status": "success", "message": "Step 1 data saved"}
    finally:
        cur.close()
        conn.close()


@router.post("/profile/setup/step2")
async def update_step2(data: Step2CulturalInfo, token: str = Depends(oauth2_scheme)):
    """
    Save Step 2: Cultural Information
    - culturalIdentity, ethnicity, religion, culturalSimilarityImportance, culturalComfortLevel, languageMatchImportant
    """
    email = get_current_user_email(token)
    user_id = get_user_id_by_email(email)

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE Users SET
                culturalIdentity = %s,
                ethnicity = %s,
                religion = %s,
                culturalSimilarityImportance = %s,
                culturalComfortLevel = %s,
                languageMatchImportant = %s
            WHERE userID = %s
            """,
            (
                data.culturalIdentity if data.culturalIdentity else None,  # TEXT[] in schema
                list_to_csv(data.ethnicity),  # VARCHAR in schema
                list_to_csv(data.religion),  # VARCHAR in schema
                data.culturalSimilarityImportance,
                data.culturalComfortLevel,
                data.languageMatchImportant,
                user_id,
            ),
        )
        conn.commit()

        # Debug: SELECT and print the updated data
        cur.execute(
            """
            SELECT userID, culturalIdentity, ethnicity, religion,
                   culturalSimilarityImportance, culturalComfortLevel, languageMatchImportant
            FROM Users WHERE userID = %s
            """,
            (user_id,),
        )
        result = cur.fetchone()

        print("\n" + "=" * 60)
        print("STEP 2 DATA SAVED TO DATABASE")
        print("=" * 60)
        print(f"userID: {result[0]}")
        print(f"culturalIdentity: {result[1]}")
        print(f"ethnicity: {result[2]}")
        print(f"religion: {result[3]}")
        print(f"culturalSimilarityImportance: {result[4]}")
        print(f"culturalComfortLevel: {result[5]}")
        print(f"languageMatchImportant: {result[6]}")
        print("=" * 60 + "\n")

        return {"status": "success", "message": "Step 2 data saved"}
    finally:
        cur.close()
        conn.close()


@router.post("/profile/setup/step3")
async def update_step3(data: Step3TravelIntent, token: str = Depends(oauth2_scheme)):
    """
    Save Step 3: Travel + Intent
    - lookingFor, socialVibe, purposeOfStay
    (availability is accepted but not stored in schema)
    """
    email = get_current_user_email(token)
    user_id = get_user_id_by_email(email)

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE Users SET
                lookingFor = %s,
                socialVibe = %s,
                purposeOfStay = %s
            WHERE userID = %s
            """,
            (
                data.lookingFor if data.lookingFor else None,  # TEXT[] in schema
                data.socialVibe if data.socialVibe else None,  # TEXT[] in schema
                data.purposeOfStay,
                user_id,
            ),
        )
        conn.commit()

        # Debug: SELECT and print the updated data
        cur.execute(
            """
            SELECT userID, lookingFor, socialVibe, purposeOfStay
            FROM Users WHERE userID = %s
            """,
            (user_id,),
        )
        result = cur.fetchone()

        print("\n" + "=" * 60)
        print("STEP 3 DATA SAVED TO DATABASE")
        print("=" * 60)
        print(f"userID: {result[0]}")
        print(f"lookingFor: {result[1]}")
        print(f"socialVibe: {result[2]}")
        print(f"purposeOfStay: {result[3]}")
        print("=" * 60 + "\n")

        return {"status": "success", "message": "Step 3 data saved"}
    finally:
        cur.close()
        conn.close()


@router.post("/profile/setup/step4")
async def update_step4(data: Step4SafetyComfort, token: str = Depends(oauth2_scheme)):
    """
    Save Step 4: Safety + Comfort
    - whoCanSeePosts, hideLocationUntilFriends, meetupPreference, boundaries

    IMPORTANT:
    Your schema defines these columns WITHOUT quotes, so Postgres stores them as lowercase:
      - whoCanSeePosts            -> whocanseeposts
      - hideLocationUntilFriends  -> hidelocationuntilfriends
      - meetupPreference          -> meetuppreference
    """
    email = get_current_user_email(token)
    user_id = get_user_id_by_email(email)

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # ✅ Use lowercase column names to match your existing schema
        cur.execute(
            """
            UPDATE Users SET
                whocanseeposts = %s,
                hidelocationuntilfriends = %s,
                meetuppreference = %s,
                boundaries = %s
            WHERE userID = %s
            """,
            (
                data.whoCanSeePosts,
                data.hideLocationUntilFriends,
                data.meetupPreference,
                data.boundaries,
                user_id,
            ),
        )
        conn.commit()

        # Debug: SELECT and print the updated data
        cur.execute(
            """
            SELECT userID, whocanseeposts, hidelocationuntilfriends, meetuppreference, boundaries
            FROM Users WHERE userID = %s
            """,
            (user_id,),
        )
        result = cur.fetchone()

        print("\n" + "=" * 60)
        print("STEP 4 DATA SAVED TO DATABASE")
        print("=" * 60)
        print(f"userID: {result[0]}")
        print(f"whoCanSeePosts: {result[1]}")
        print(f"hideLocationUntilFriends: {result[2]}")
        print(f"meetupPreference: {result[3]}")
        print(f"boundaries: {result[4]}")
        print("=" * 60 + "\n")

        return {"status": "success", "message": "Step 4 data saved"}
    finally:
        cur.close()
        conn.close()


@router.post("/profile/setup/step5")
async def update_step5(data: Step5ProfileCustomization, token: str = Depends(oauth2_scheme)):
    """
    Save Step 5: Profile Customization
    - bio, AboutMe
    (interests/badges are accepted but not stored in schema)
    """
    email = get_current_user_email(token)
    user_id = get_user_id_by_email(email)

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE Users SET
                bio = %s,
                AboutMe = %s
            WHERE userID = %s
            """,
            (
                data.bio,
                data.AboutMe,
                user_id,
            ),
        )
        conn.commit()

        # Debug: SELECT and print the updated data
        cur.execute(
            """
            SELECT userID, bio, AboutMe
            FROM Users WHERE userID = %s
            """,
            (user_id,),
        )
        result = cur.fetchone()

        print("\n" + "=" * 60)
        print("STEP 5 DATA SAVED TO DATABASE")
        print("=" * 60)
        print(f"userID: {result[0]}")
        print(f"bio: {result[1]}")
        print(f"AboutMe: {result[2]}")
        print("=" * 60 + "\n")

        return {"status": "success", "message": "Step 5 data saved"}
    finally:
        cur.close()
        conn.close()


@router.post("/profile/setup/step6")
async def update_step6(data: Step6MatchFilters, token: str = Depends(oauth2_scheme)):
    """
    Save Step 6: Match Filters
    - agePreference, verifiedStudentsOnly
    (culturalSimilarity is accepted but not stored in schema)
    """
    email = get_current_user_email(token)
    user_id = get_user_id_by_email(email)

    # agePreference is stored as INT in schema. Your incoming data is a dict.
    # We'll try to pull a numeric "range" safely; otherwise default to 5.
    age_pref_value = 5
    if data.agePreference and isinstance(data.agePreference, dict):
        raw = data.agePreference.get("range")
        if isinstance(raw, int):
            age_pref_value = raw

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE Users SET
                agePreference = %s,
                verifiedStudentsOnly = %s
            WHERE userID = %s
            """,
            (
                age_pref_value,
                data.verifiedStudentsOnly,
                user_id,
            ),
        )
        conn.commit()

        # Debug: SELECT and print the updated data
        cur.execute(
            """
            SELECT userID, agePreference, verifiedStudentsOnly
            FROM Users WHERE userID = %s
            """,
            (user_id,),
        )
        result = cur.fetchone()

        print("\n" + "=" * 60)
        print("STEP 6 DATA SAVED TO DATABASE - PROFILE SETUP COMPLETE")
        print("=" * 60)
        print(f"userID: {result[0]}")
        print(f"agePreference: {result[1]}")
        print(f"verifiedStudentsOnly: {result[2]}")
        print("=" * 60 + "\n")

        return {
            "status": "success",
            "message": "Step 6 data saved - Profile setup complete!",
        }
    finally:
        cur.close()
        conn.close()
