"""
Gets post and people recommendations from database
"""
from __future__ import annotations
from typing import List
import psycopg2
import os


def _get_conn() -> psycopg2.extensions.connection:
    """Create and return a new database connection."""
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "hacks13"),
        user=os.getenv("DB_USER", "jennifer"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )


def recommend_posts(user_id: int, limit: int = 50) -> List[int]:
    """
    Return the user's event_recs as a list of post IDs.
    """
    sql_get_recs = """
        SELECT event_recs_emb
        FROM users
        WHERE userid = %s;
    """

    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql_get_recs, (user_id,))
            row = cur.fetchone()
    finally:
        conn.close()

    if not row or not row[0]:
        return []

    post_ids = [rec["postid"] for rec in row[0]]
    return post_ids[:limit]


def recommend_people(user_id: int, limit: int = 50) -> List[int]:
    """
    Return list of recommended user IDs from users.people_recs (ignore scores).
    """
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT people_recs FROM users WHERE userid = %s;", (user_id,))
            row = cur.fetchone()
    finally:
        conn.close()

    if not row or not row[0]:
        return []

    rec_dicts = row[0]
    return [int(d["userid"]) for d in rec_dicts if "userid" in d][:limit]

if __name__=="__main__":
    test_user_id = 482193
    ppl_recs = recommend_people(test_user_id, limit=10)
    post_recs = recommend_posts(test_user_id, limit=10)
    print(ppl_recs)
    print(post_recs)