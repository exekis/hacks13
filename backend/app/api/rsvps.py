from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2
import os
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RsvpRequest(BaseModel):
    userId: int

router = APIRouter()

def get_db_connection():
    logger.info("Attempting to connect to the database...")
    try:
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST"),
            database=os.environ.get("DB_NAME"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
        )
        logger.info("Database connection successful.")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

@router.post("/posts/{post_id}/rsvp")
def rsvp_to_post(post_id: int, rsvp_request: RsvpRequest):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        logger.info(f"Fetching RSVP list for user {rsvp_request.userId}")
        cur.execute("SELECT RSVP FROM Users WHERE userID = %s", (rsvp_request.userId,))
        rsvp_list = cur.fetchone()
        if rsvp_list is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        rsvp_list = rsvp_list[0] if rsvp_list[0] is not None else []
        logger.info(f"Current RSVP list: {rsvp_list}")
        
        if post_id not in rsvp_list:
            logger.info(f"Adding post {post_id} to RSVP list")
            rsvp_list.append(post_id)
            cur.execute("UPDATE Users SET RSVP = %s WHERE userID = %s", (rsvp_list, rsvp_request.userId))
            conn.commit()
            logger.info("RSVP list updated successfully")
        else:
            logger.info(f"Post {post_id} already in RSVP list")
        
        return {"message": "RSVP successful"}
    except Exception as e:
        logger.error(f"An error occurred while RSVPing: {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()
            logger.info("Database connection closed.")

@router.get("/users/{user_id}/rsvps")
def get_rsvpd_posts(user_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        logger.info(f"Fetching RSVP list for user {user_id}")
        cur.execute("SELECT RSVP FROM Users WHERE userID = %s", (user_id,))
        rsvp_list = cur.fetchone()

        if rsvp_list is None:
            raise HTTPException(status_code=404, detail="User not found")

        rsvp_list = rsvp_list[0] if rsvp_list[0] is not None else []
        logger.info(f"Current RSVP list: {rsvp_list}")

        if not rsvp_list:
            return []

        logger.info(f"Fetching posts with IDs: {rsvp_list}")
        query = """
            SELECT p.PostID, p.user_id, p.post_content, p.capacity, p.start_time, p.end_time, p.location_str, p.is_event, p.time_posted, u.Name, u.currentCity
            FROM Posts p
            JOIN Users u ON p.user_id = u.userID
            WHERE p.PostID = ANY(%s)
        """
        cur.execute(query, (rsvp_list,))
        posts = cur.fetchall()
        logger.info(f"Found {len(posts)} posts")
        
        response_posts = [
            {
                "id": post[0],
                "user_id": post[1],
                "post_content": post[2],
                "capacity": post[3],
                "start_time": post[4],
                "end_time": post[5],
                "location_str": post[6],
                "is_event": post[7],
                "time_posted": post[8],
                "author_name": post[9],
                "author_location": post[10]
            }
            for post in posts
        ]
        
        print(f"RSVP'd posts: {response_posts}")

        return response_posts
    except Exception as e:
        logger.error(f"An error occurred while fetching RSVPed posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cur.close()
            conn.close()
            logger.info("Database connection closed.")
