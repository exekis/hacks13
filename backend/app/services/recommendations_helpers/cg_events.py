"""
Docstring for backend.app.services.recommendations_helpers.cg_events

Candidate generation for events recommendation
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

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


def store_events_recs_candidates(conn: psycopg2.extensions.connection) -> List[Dict[str, Any]]:
    """Store top 50 candidate posts ranked by distance."""
    sql_events_cg = """
        UPDATE users u
        -- Set events_recs column
        SET event_recs = recs.recs
        FROM (
        SELECT
            u2.userid,
            array_agg(
            jsonb_build_object(
                'postid', p.postid,
                'distance', p.distance
            )
            ORDER BY p.distance
            ) AS recs
        FROM users u2
        JOIN LATERAL (
            SELECT
                p.postid,
                (p.post_embedding <=> u2.user_embedding) AS distance
            FROM posts p
            WHERE p.post_embedding IS NOT NULL
                AND u2.user_embedding IS NOT NULL
                -- Don't recommend a user their own posts
                AND p.user_id <> u2.userid
            -- Order by dist
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


def get_event_recs(
    conn: psycopg2.extensions.connection,
    user_id: int,
    num_recs: int = 50,
) -> List[int]:
    """
    Return the user's event_recs as a list of post IDs.
    Truncates to num_recs.
    """
    sql_get_recs = """
        SELECT event_recs
        FROM users
        WHERE userid = %s;
    """

    with conn.cursor() as cur:
        cur.execute(sql_get_recs, (user_id,))
        row = cur.fetchone()

    if not row or not row[0]:
        return []

    # row[0] is JSONB[] like:
    print(f"TESTING RECS: {row[0][:10]}")
    post_ids = [rec["postid"] for rec in row[0]]
    return post_ids[:num_recs]


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
    store_events_recs_candidates(conn)
    
    test_user_id = 482193
    recs = get_event_recs(conn, test_user_id, num_recs=10)
    print("Top 10 recommended post IDs:", recs)

    conn.close()
