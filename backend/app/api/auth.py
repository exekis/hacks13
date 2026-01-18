from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
import psycopg2
import hashlib
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 45

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int


class TokenData(BaseModel):
    email: str | None = None

class User(BaseModel):
    email: str
    password: str


# connect to the database

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST"),
        database=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
    )

def hash_password(password: str) -> str:
    """simple sha256 hash for demo purposes"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """verify password against sha256 hash"""
    return hash_password(plain_password) == hashed_password

def get_password_hash(password: str) -> str:
    """get sha256 hash of password"""
    return hash_password(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=Token)
async def signup(user: User):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get new userID (simple; not concurrency-safe but fine for your "easy" requirement)
        cur.execute("SELECT COALESCE(MAX(userID), 0) FROM Users")
        new_user_id = cur.fetchone()[0] + 1

        # Create new user
        cur.execute("INSERT INTO Users (userID, Email) VALUES (%s, %s)", (new_user_id, user.email))

        # Hash the password
        hashed_password = get_password_hash(user.password)

        # Store auth info
        cur.execute(
            "INSERT INTO Auth (userID, password_hash) VALUES (%s, %s)",
            (new_user_id, hashed_password),
        )

        conn.commit()

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        return {"access_token": access_token, "token_type": "bearer", "user_id": new_user_id}
    finally:
        cur.close()
        conn.close()


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cur = conn.cursor()

    # Get user by email
    cur.execute("SELECT userID FROM Users WHERE Email = %s", (form_data.username,))
    user_record = cur.fetchone()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = user_record[0]

    # Get password hash
    cur.execute("SELECT password_hash FROM Auth WHERE userID = %s", (user_id,))
    auth_record = cur.fetchone()
    if not auth_record:
        # This case should ideally not happen if data is consistent
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication data not found for user",
        )

    hashed_password = auth_record[0]

    cur.close()
    conn.close()

    if not verify_password(form_data.password, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

