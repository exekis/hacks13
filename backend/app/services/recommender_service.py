"""
Gets post and people recommendations from database
"""
from __future__ import annotations
from typing import Any, Dict, List
from app.services.helpers.db_helpers import get_conn


def recommend_posts(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Return recommended posts for a user, including post details and author info.
    event_recs_emb is assumed to be an array-like column where each element is a JSON object
    containing at least {"postid": <int>}.

    Returns: List[{"postid": int, "time_posted": ..., "post_content": ..., "author_id": ..., "author_name": ..., "author_location": ...}]
    """
    sql_get_recs = """
        SELECT event_recs_emb
        FROM users
        WHERE userid = %s;
    """

    # pull post details with author info, preserving the same order as in recs
    sql_get_posts = """
        WITH rec_ids AS (
            SELECT
                rec_postid,
                ord
            FROM unnest(%s::int[]) WITH ORDINALITY AS t(rec_postid, ord)
        )
        SELECT
            p.postid,
            p.time_posted,
            p.post_content,
            p.user_id,
            u.name as author_name,
            u.currentCity as author_location
        FROM rec_ids r
        JOIN posts p ON p.postid = r.rec_postid
        LEFT JOIN users u ON u.userid = p.user_id
        ORDER BY r.ord
        LIMIT %s;
    """

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # 1) fetch the rec list
            cur.execute(sql_get_recs, (user_id,))
            row = cur.fetchone()

            if not row or not row[0]:
                return []

            # 2) extract post ids (handle dict keys safely)
            recs = row[0]
            post_ids = []
            for rec in recs:
                # support {"postid": 123} or {"postID": 123} just in case
                pid = rec.get("postid") if isinstance(rec, dict) else None
                if pid is None and isinstance(rec, dict):
                    pid = rec.get("postID")
                if pid is not None:
                    post_ids.append(int(pid))

            if not post_ids:
                return []

            post_ids = post_ids[:limit]

            # 3) fetch post details with author info (preserving the recommendation order)
            cur.execute(sql_get_posts, (post_ids, limit))
            rows = cur.fetchall()

            return [
                {
                    "postid": r[0],
                    "time_posted": r[1].isoformat() if r[1] else None,
                    "post_content": r[2],
                    "author_id": r[3],
                    "author_name": r[4] or f"User {r[3]}",
                    "author_location": r[5],
                }
                for r in rows
            ]
    finally:
        conn.close()


def recommend_people(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Return recommended people for a user, including:
    userid, name, pronouns, currentCity, travelingTo, age, bio, languages, lookingFor, culturalIdentity

    users.people_recs is assumed to be JSONB (a JSON array) like:
      [{"userid": 123, "score": ...}, {"userid": 456, ...}, ...]
    We ignore scores and just use the userid ordering as stored.
    """
    sql_get_recs = """
        SELECT people_recs
        FROM users
        WHERE userid = %s;
    """

    # preserve ordering using unnest + ordinality, fetch more user details
    sql_get_users = """
        WITH rec_ids AS (
            SELECT rec_userid, ord
            FROM unnest(%s::int[]) WITH ORDINALITY AS t(rec_userid, ord)
        )
        SELECT
            u.userid,
            u.name,
            u.pronouns,
            u.currentCity,
            u.travelingTo,
            u.age,
            u.bio,
            u.languages,
            u.lookingFor,
            u.culturalIdentity,
            u.isStudent,
            u.university
        FROM rec_ids r
        JOIN users u ON u.userid = r.rec_userid
        ORDER BY r.ord
        LIMIT %s;
    """

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql_get_recs, (user_id,))
            row = cur.fetchone()

            if not row or not row[0]:
                return []

            recs = row[0]

            # recs might be a list of dicts (JSONB array decoded by psycopg2)
            rec_user_ids: list[int] = []
            for d in recs:
                if isinstance(d, dict) and "userid" in d and d["userid"] is not None:
                    rec_user_ids.append(int(d["userid"]))

            if not rec_user_ids:
                return []

            rec_user_ids = rec_user_ids[:limit]

            cur.execute(sql_get_users, (rec_user_ids, limit))
            rows = cur.fetchall()

            return [
                {
                    "userid": r[0],
                    "name": r[1] or f"User {r[0]}",
                    "pronouns": r[2],
                    "currentCity": r[3],
                    "travelingTo": r[4],
                    "age": r[5],
                    "bio": r[6],
                    "languages": r[7] or [],
                    "lookingFor": r[8] or [],
                    "culturalIdentity": r[9] or [],
                    "isStudent": r[10],
                    "university": r[11],
                }
                for r in rows
            ]
    finally:
        conn.close()

if __name__=="__main__":
    test_user_id = 482193
    ppl_recs = recommend_people(test_user_id, limit=10)
    post_recs = recommend_posts(test_user_id, limit=10)
    print(ppl_recs)
    print(post_recs)