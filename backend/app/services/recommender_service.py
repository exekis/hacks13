"""
Gets post and people recommendations from database

python -m app.services.recommender_service
"""
from __future__ import annotations
from typing import Any, Dict, List
from app.services.helpers.db_helpers import get_conn
from app.services.helpers.store_event_recs_in_db_dis import store_post_recs_dis
from app.services.helpers.store_event_recs_in_db_emb import store_user_avg_embedding, store_events_recs_candidates
from app.services.helpers.store_people_recs_in_db import store_people_recs


def recommend_posts(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Return recommended posts for a user

    Order rules:
      1) postIDs that appear in BOTH event_recs_emb and event_recs_dis (in dis order)
      2) remaining postIDs that appear only in dis (in dis order)
      3) remaining postIDs that appear only in emb (in emb order)

    Returns:
      List[{
        "postid": int,
        "time_posted": str|None,
        "post_content": str|None,
        "author_id": int|None,
        "author_name": str,
        "author_location": str|None
      }]
    """
    sql_get_recs = """
        SELECT
            event_recs_emb,
            event_recs_dis
        FROM users
        WHERE userid = %s;
    """

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
            u.name AS author_name,
            u.currentCity AS author_location
        FROM rec_ids r
        JOIN posts p ON p.postid = r.rec_postid
        LEFT JOIN users u ON u.userid = p.user_id
        ORDER BY r.ord
        LIMIT %s;
    """

    def extract_post_ids(recs: Any) -> List[int]:
        """Extract post IDs from a JSONB[] array of dicts, preserving order."""
        if not recs:
            return []
        out: List[int] = []
        for rec in recs:
            if not isinstance(rec, dict):
                continue
            pid = rec.get("postid")
            if pid is None:
                pid = rec.get("postID")
            if pid is None:
                continue
            try:
                out.append(int(pid))
            except (TypeError, ValueError):
                continue
        return out

    def unique_preserve_order(ids: List[int]) -> List[int]:
        seen = set()
        out: List[int] = []
        for x in ids:
            if x in seen:
                continue
            seen.add(x)
            out.append(x)
        return out

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # 1) fetch both rec lists
            cur.execute(sql_get_recs, (user_id,))
            row = cur.fetchone()
            if not row:
                return []

            emb_recs = row[0] or []
            dis_recs = row[1] or []

            emb_ids = extract_post_ids(emb_recs)
            dis_ids = extract_post_ids(dis_recs)

            if not emb_ids and not dis_ids:
                return []

            emb_set = set(emb_ids)

            # 2) build ordered unique list: (both) + (dis) + (emb)
            both_in_dis_order = [pid for pid in dis_ids if pid in emb_set]
            combined_ids = unique_preserve_order(both_in_dis_order + dis_ids + emb_ids)

            if not combined_ids:
                return []

            combined_ids = combined_ids[:limit]

            # 3) fetch post details with author info in the same order
            cur.execute(sql_get_posts, (combined_ids, limit))
            rows = cur.fetchall()

            return [
                {
                    "postid": r[0],
                    "time_posted": r[1].isoformat() if r[1] else None,
                    "post_content": r[2],
                    "author_id": r[3],
                    "author_name": r[4] or (f"User {r[3]}" if r[3] is not None else "Unknown"),
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


def recommend_mixed_feed(user_id: int, limit: int = 50, seed: int | None = None) -> List[Dict[str, Any]]:
    """
    Simplest mixed feed:
      - pull posts + people (each up to `limit`)
      - tag each item with type {"post","person"}
      - shuffle everything together
      - return first `limit`
    """
    import random

    posts = recommend_posts(user_id, limit=limit)
    people = recommend_people(user_id, limit=limit)

    mixed: List[Dict[str, Any]] = (
        [{"type": "post", **p} for p in posts] +
        [{"type": "person", **u} for u in people]
    )

    rng = random.Random(seed)
    rng.shuffle(mixed)

    return mixed[:limit]


def refresh_feed():
    conn = get_conn()
    store_post_recs_dis(conn)
    store_user_avg_embedding(conn)
    store_events_recs_candidates(conn)
    store_people_recs(conn)
    return "Stored all"

if __name__=="__main__":
    test_user_id = 482193
    ppl_recs = recommend_people(test_user_id, limit=10)
    post_recs = recommend_posts(test_user_id, limit=10)
    #print(ppl_recs)
    #print(post_recs)
    mixed_feed = recommend_mixed_feed(test_user_id, limit=10)
    #print(mixed_feed)