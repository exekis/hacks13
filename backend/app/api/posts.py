from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2
import os
from app.schemas.post import PostCreate
from pydantic import BaseModel

router = APIRouter()

def get_db_connection():
    print("Attempting to connect to the database...")
    try:
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST"),
            database=os.environ.get("DB_NAME"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
        )
        print("Database connection successful.")
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise

@router.post("/posts")
def create_post(post: PostCreate):
    print(f"Received request to create post: {post.dict()}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        print("Executing INSERT statement...")
        cur.execute(
            """INSERT INTO Posts (user_id, post_content, capacity, start_time, end_time, location_str, is_event)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING PostID""",
            (post.user_id, post.post_content, post.capacity, post.start_time, post.end_time, post.location_str, True)
        )
        post_id = cur.fetchone()[0]
        print(f"Post created with ID: {post_id}")
        conn.commit()
        return {"PostID": post_id}
    except Exception as e:
        print(f"An error occurred: {e}")
        if conn:
            conn.rollback()
            print("Transaction rolled back.")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()
            print("Database connection closed.")
