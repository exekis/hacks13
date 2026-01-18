"""
Docstring for app.services.recommendations_helpers.cg_events

Candidate generation for events recommendation

cd backend
python -m app.services.helpers.store_event_recs_in_db_emb
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

import os

def store_user_avg_embedding(conn: psycopg2.extensions.connection) -> None:
    """Compute user_embedding from avg post_embedding only if missing."""
    sql_calculate_user_embeddings = """
        UPDATE users u
        SET user_embedding = avg_embeddings.avg_vec
        FROM (
            SELECT p.user_id, avg(p.post_embedding) AS avg_vec
            FROM posts p
            WHERE p.post_embedding IS NOT NULL
            GROUP BY p.user_id
        ) avg_embeddings
        WHERE u.userid = avg_embeddings.user_id
        AND u.user_embedding IS NULL;
    """
    with conn.cursor() as cur:
        cur.execute(sql_calculate_user_embeddings)
    conn.commit()


def store_post_recs_emb(conn: psycopg2.extensions.connection, refresh: bool = False) -> None:
    """
    Store top 50 candidate posts ranked by embedding distance into users.event_recs_emb.

    If refresh=True, keep the same 50 candidates but store them in random order
    (Postgres-side shuffle) instead of distance order.
    """
    order_clause = "ORDER BY random()" if refresh else "ORDER BY p.distance"

    sql_events_cg = f"""
        UPDATE users u
        SET event_recs_emb = recs.recs
        FROM (
            SELECT
                u2.userid,
                array_agg(
                    jsonb_build_object(
                        'postid', p.postid,
                        'distance', p.distance
                    )
                    {order_clause}
                ) AS recs
            FROM users u2
            JOIN LATERAL (
                SELECT
                    p.postid,
                    (p.post_embedding <=> u2.user_embedding) AS distance
                FROM posts p
                WHERE p.post_embedding IS NOT NULL
                  AND u2.user_embedding IS NOT NULL
                  AND p.user_id <> u2.userid
                ORDER BY (p.post_embedding <=> u2.user_embedding)
                LIMIT 50
            ) p ON TRUE
            GROUP BY u2.userid
        ) recs
        WHERE u.userid = recs.userid;
    """

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql_events_cg)
    conn.commit()



def get_event_recs_emb(conn: psycopg2.extensions.connection, user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
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

if __name__ == "__main__":
    import os
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "hacks13"),
        user=os.getenv("DB_USER", "jennifer"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )

    store_user_avg_embedding(conn)
    print("Stored user embeddings")
    store_post_recs_emb(conn)
    print("Stored event recommendations")
    
    test_user_id = 482193
    recs = get_event_recs_emb(test_user_id, limit=10)
    print("Top 10 recommended post IDs:", recs)

    conn.close()
