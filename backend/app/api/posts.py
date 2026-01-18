from fastapi import APIRouter, Depends, HTTPException
import psycopg2
import os
from app.schemas.post import PostCreate

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


@router.post("/posts/{post_id}/rsvp")
def rsvp_to_post(post_id: int, user_id: int):
    """add user to post rsvps array"""
    print(f"RSVP request: user {user_id} to post {post_id}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # add user_id to rsvps array if not already present
        cur.execute(
            """UPDATE Posts 
               SET rsvps = array_append(
                   COALESCE(rsvps, ARRAY[]::INT[]), 
                   %s
               )
               WHERE PostID = %s AND (rsvps IS NULL OR NOT %s = ANY(rsvps))
               RETURNING PostID, rsvps""",
            (user_id, post_id, user_id)
        )
        result = cur.fetchone()
        conn.commit()
        if result:
            return {"post_id": result[0], "rsvps": result[1]}
        return {"message": "Already RSVP'd or post not found"}
    except Exception as e:
        print(f"RSVP error: {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()


@router.delete("/posts/{post_id}/rsvp")
def cancel_rsvp(post_id: int, user_id: int):
    """remove user from post rsvps array"""
    print(f"Cancel RSVP request: user {user_id} from post {post_id}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """UPDATE Posts 
               SET rsvps = array_remove(rsvps, %s)
               WHERE PostID = %s
               RETURNING PostID, rsvps""",
            (user_id, post_id)
        )
        result = cur.fetchone()
        conn.commit()
        if result:
            return {"post_id": result[0], "rsvps": result[1]}
        return {"message": "Post not found"}
    except Exception as e:
        print(f"Cancel RSVP error: {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()


@router.get("/posts/user/{user_id}/hosted")
def get_user_hosted_posts(user_id: int):
    """get posts created by user (events they are hosting)"""
    print(f"Fetching hosted posts for user {user_id}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """SELECT p.PostID, p.user_id, p.location_str, p.post_content, 
                      p.is_event, p.time_posted, p.rsvps, p.capacity, 
                      p.start_time, p.end_time,
                      u.Name as author_name, u.currentCity as author_location
               FROM Posts p
               LEFT JOIN Users u ON p.user_id = u.userID
               WHERE p.user_id = %s AND p.is_event = TRUE
               ORDER BY p.start_time DESC""",
            (user_id,)
        )
        rows = cur.fetchall()
        posts = []
        for row in rows:
            posts.append({
                "postid": row[0],
                "user_id": row[1],
                "location_str": row[2],
                "post_content": row[3],
                "is_event": row[4],
                "time_posted": row[5].isoformat() if row[5] else None,
                "rsvps": row[6] or [],
                "capacity": row[7],
                "start_time": row[8].isoformat() if row[8] else None,
                "end_time": row[9].isoformat() if row[9] else None,
                "author_name": row[10] or "Traveler",
                "author_location": row[11]
            })
        return posts
    except Exception as e:
        print(f"Error fetching hosted posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()


@router.get("/posts/user/{user_id}/attending")
def get_user_attending_posts(user_id: int):
    """get posts user has rsvp'd to (events they are attending)"""
    print(f"Fetching attending posts for user {user_id}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """SELECT p.PostID, p.user_id, p.location_str, p.post_content, 
                      p.is_event, p.time_posted, p.rsvps, p.capacity, 
                      p.start_time, p.end_time,
                      u.Name as author_name, u.currentCity as author_location
               FROM Posts p
               LEFT JOIN Users u ON p.user_id = u.userID
               WHERE %s = ANY(p.rsvps)
               ORDER BY p.start_time DESC""",
            (user_id,)
        )
        rows = cur.fetchall()
        posts = []
        for row in rows:
            posts.append({
                "postid": row[0],
                "user_id": row[1],
                "location_str": row[2],
                "post_content": row[3],
                "is_event": row[4],
                "time_posted": row[5].isoformat() if row[5] else None,
                "rsvps": row[6] or [],
                "capacity": row[7],
                "start_time": row[8].isoformat() if row[8] else None,
                "end_time": row[9].isoformat() if row[9] else None,
                "author_name": row[10] or "Traveler",
                "author_location": row[11]
            })
        return posts
    except Exception as e:
        print(f"Error fetching attending posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()
