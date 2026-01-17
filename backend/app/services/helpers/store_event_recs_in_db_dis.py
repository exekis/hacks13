"""
recommendation service for travelmate

implements deterministic, fair recommendation algorithm
no external apis, no embeddings, no heavy ml

cd backend
python -m app.services.helpers.store_event_recs_in_db_dis
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor

from app.services.helpers.similarity_helpers import (
    jaccard,
    recency_score,
    post_location_match,
)

# diversity constraints
MAX_POSTS_SAME_AUTHOR = 3


# -----------------------------
# DB helpers
# -----------------------------

def get_conn() -> psycopg2.extensions.connection:
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "hacks13"),
        user=os.getenv("DB_USER", "jennifer"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )


def _table_exists(conn: psycopg2.extensions.connection, table_name: str) -> bool:
    sql = """
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = %s
    );
    """
    with conn.cursor() as cur:
        cur.execute(sql, (table_name.lower(),))
        return bool(cur.fetchone()[0])


# -----------------------------
# Data access (viewer + graph)
# -----------------------------

SQL_GET_VIEWER = """
SELECT
  userid,
  COALESCE(currentCity, '') AS currentcity,
  travelingTo AS travelingto,
  COALESCE(lookingFor, ARRAY[]::text[]) AS goals,
  COALESCE(Friends, ARRAY[]::int[]) AS friends,
  COALESCE(BlockedUsers, ARRAY[]::int[]) AS blockedusers
FROM users
WHERE userid = %s;
"""

SQL_BLOCKED_BY = """
SELECT userid
FROM users
WHERE %s = ANY(COALESCE(BlockedUsers, ARRAY[]::int[]));
"""

SQL_GET_FRIENDS_FOR_USERS = """
SELECT userid, COALESCE(Friends, ARRAY[]::int[]) AS friends
FROM users
WHERE userid = ANY(%s);
"""


# -----------------------------
# Candidate generation (SQL-first)
# -----------------------------

# Posts by friends (excluding blocked authors)
SQL_FRIEND_POSTS = """
SELECT
  p.postid,
  p.user_id AS author_id,
  COALESCE(p.location_str, '') AS coarse_location,
  p.time_posted,
  COALESCE(p.post_content, '') AS post_content
FROM posts p
WHERE p.user_id = ANY(%s)        -- viewer friends
  AND NOT (p.user_id = ANY(%s)); -- excluded authors
"""

# Posts by friends-of-friends with location match
SQL_FOF_POSTS_WITH_LOCATION = """
SELECT
  p.postid,
  p.user_id AS author_id,
  COALESCE(p.location_str, '') AS coarse_location,
  p.time_posted,
  COALESCE(p.post_content, '') AS post_content
FROM posts p
WHERE p.user_id = ANY(%s)        -- fof ids
  AND NOT (p.user_id = ANY(%s))  -- excluded authors
  AND (
      lower(COALESCE(p.location_str, '')) LIKE %s
      OR (%s IS NOT NULL AND lower(COALESCE(p.location_str, '')) LIKE %s)
  );
"""

# RSVP candidates (if PostRSVPs exists)
# We grab posts where at least 1 friend RSVP'd.
SQL_RSVP_POSTS_BY_FRIENDS = """
SELECT DISTINCT
  p.postid,
  p.user_id AS author_id,
  COALESCE(p.location_str, '') AS coarse_location,
  p.time_posted,
  COALESCE(p.post_content, '') AS post_content
FROM postrsvps r
JOIN posts p ON p.postid = r.post_id
WHERE r.user_id = ANY(%s)          -- viewer friends
  AND NOT (p.user_id = ANY(%s));   -- excluded authors
"""

SQL_RSVP_FRIEND_COUNT_FOR_POSTS = """
SELECT r.post_id, COUNT(*)::int AS friend_rsvp_count
FROM postrsvps r
WHERE r.user_id = ANY(%s)          -- viewer friends
  AND r.post_id = ANY(%s)          -- candidate post ids
GROUP BY r.post_id;
"""

SQL_GET_AUTHORS = """
SELECT
  userid,
  COALESCE(name, '') AS name,
  COALESCE(isStudent, false) AS verified_student
FROM users
WHERE userid = ANY(%s);
"""


# -----------------------------
# Lightweight tag extraction (for goals_match)
# -----------------------------

_WORD_RE = re.compile(r"[a-zA-Z']{2,}")

def _derive_post_tags_from_content(content: str, max_tags: int = 12) -> List[str]:
    """
    Your demo algorithm had post.tags; your DB schema doesn't.
    To preserve the 'goals_match = jaccard(user.goals, post.tags)' logic,
    we derive simple tags from the content text.
    """
    text = (content or "").lower()
    tokens = _WORD_RE.findall(text)
    # keep unique, stable order
    seen = set()
    tags: List[str] = []
    for t in tokens:
        if t in seen:
            continue
        seen.add(t)
        tags.append(t)
        if len(tags) >= max_tags:
            break
    return tags


# -----------------------------
# Core algorithm data structures
# -----------------------------

@dataclass
class ScoredCandidate:
    """intermediate representation with score"""
    id: str
    score: float
    primary_culture: str | None = None
    primary_language: str | None = None
    author_id: str | None = None  # for posts


# ---------------------------------------------------------------------------
# candidate generation (DB-backed)
# ---------------------------------------------------------------------------

def generate_post_candidates(
    conn: psycopg2.extensions.connection,
    user_id: str,
    viewer: Dict[str, Any],
    user_friends: Set[str],
    excluded_authors: Set[str],
) -> List[str]:
    """
    SAME logic as your state version:
      1) posts by friends
      2) posts rsvpd by friends
      3) posts by fof and in same city/destination
    excludes:
      - posts whose author is blocked by user
      - posts whose author has blocked user
    """
    candidates: Set[int] = set()

    friends_int = [int(x) for x in user_friends] if user_friends else []
    excluded_int = [int(x) for x in excluded_authors] if excluded_authors else []

    viewer_city = (viewer.get("currentcity") or "").strip().lower()
    viewer_dest = (viewer.get("travelingto") or None)
    viewer_dest_lower = viewer_dest.strip().lower() if isinstance(viewer_dest, str) and viewer_dest.strip() else None

    # ---- (1) posts by friends ----
    if friends_int:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_FRIEND_POSTS, (friends_int, excluded_int))
            for row in cur.fetchall():
                candidates.add(int(row["postid"]))

    # ---- (2) posts rsvpd by friends (optional table) ----
    if friends_int and _table_exists(conn, "postrsvps"):
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_RSVP_POSTS_BY_FRIENDS, (friends_int, excluded_int))
            for row in cur.fetchall():
                candidates.add(int(row["postid"]))

    # ---- (3) posts by friends-of-friends in same city/destination ----
    # Build fof = union(friends-of-friends) - self - friends
    fof_ids: Set[int] = set()
    if friends_int:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_GET_FRIENDS_FOR_USERS, (friends_int,))
            for r in cur.fetchall():
                fset = set(r.get("friends") or [])
                fof_ids.update(fset)

    # remove viewer and direct friends
    fof_ids.discard(int(user_id))
    fof_ids.difference_update(set(friends_int))

    if fof_ids:
        city_like = f"%{viewer_city}%" if viewer_city else "%"
        dest_like = f"%{viewer_dest_lower}%" if viewer_dest_lower else None

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                SQL_FOF_POSTS_WITH_LOCATION,
                (
                    list(fof_ids),
                    excluded_int,
                    city_like,
                    viewer_dest_lower,
                    dest_like if dest_like else "%",
                ),
            )
            for row in cur.fetchall():
                candidates.add(int(row["postid"]))

    # Return list[str] for compatibility with downstream logic
    return [str(pid) for pid in candidates]


# ---------------------------------------------------------------------------
# scoring (DB-backed)
# ---------------------------------------------------------------------------

def score_post(
    viewer: Dict[str, Any],
    post_row: Dict[str, Any],
    author_row: Dict[str, Any],
    user_friends: Set[str],
    friend_rsvp_count: int,
) -> float:
    """
    SAME scoring logic as your state version, but using DB fields:

    score =
      0.35 * friend_author +
      0.20 * rsvpd_by_friends_norm +
      0.20 * location_match +
      0.15 * goals_match +
      0.10 * post_recency +
      0.05 if author.verified_student
    """
    post_author_id = str(post_row["author_id"])

    # friend author
    friend_author = 1.0 if post_author_id in user_friends else 0.0

    # rsvpd by friends
    rsvpd_norm = min(int(friend_rsvp_count or 0), 5) / 5

    # location match
    loc_match = post_location_match(
        post_row.get("coarse_location") or "",
        viewer.get("currentcity") or "",
        viewer.get("travelingto") or None,
    )

    # goals match: jaccard(user.goals, post.tags)
    viewer_goals = viewer.get("goals") or []
    post_tags = _derive_post_tags_from_content(post_row.get("content") or "")
    goals_match = jaccard(viewer_goals, post_tags)

    # recency
    recent = recency_score(post_row.get("time_posted"))

    # verified bonus (map to isStudent)
    verified_bonus = 0.05 if bool(author_row.get("verified_student")) else 0.0

    score = (
        0.35 * friend_author +
        0.20 * rsvpd_norm +
        0.20 * loc_match +
        0.15 * goals_match +
        0.10 * recent +
        verified_bonus
    )

    return float(score)


# ---------------------------------------------------------------------------
# reranking for fairness and diversity (same logic)
# ---------------------------------------------------------------------------

def rerank_posts(
    user_id: str,
    scored: List[ScoredCandidate],
    limit: int,
) -> List[ScoredCandidate]:
    adjusted = []
    for sc in scored:
        adjusted.append(ScoredCandidate(
            id=sc.id,
            score=sc.score,
            author_id=sc.author_id,
        ))

    # sort by adjusted score descending
    adjusted.sort(key=lambda x: -x.score)

    # apply author diversity constraint
    result: List[ScoredCandidate] = []
    author_counts: Dict[str, int] = {}

    for sc in adjusted:
        if len(result) >= limit:
            break

        if sc.author_id:
            current_count = author_counts.get(sc.author_id, 0)
            if current_count >= MAX_POSTS_SAME_AUTHOR:
                continue
            author_counts[sc.author_id] = current_count + 1

        result.append(sc)

    return result


# ---------------------------------------------------------------------------
# main recommendation function (DB-backed)
# ---------------------------------------------------------------------------

def recommend_posts(
    user_id: str,
    limit: int = 30,
) -> List[int]:
    """
    DB-backed deterministic algorithm (same structure):
    1) generate candidates (friend posts, rsvpd by friends, fof posts)
    2) score each candidate
    3) rerank for diversity
    4) return top limit
    """
    conn = get_conn()
    try:
        # ---- load viewer ----
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_GET_VIEWER, (int(user_id),))
            viewer = cur.fetchone()

        if not viewer:
            return []

        user_friends: Set[str] = {str(x) for x in (viewer.get("friends") or [])}
        user_blocked: Set[str] = {str(x) for x in (viewer.get("blockedusers") or [])}

        # blocked_by: users who blocked viewer
        blocked_by: Set[str] = set()
        with conn.cursor() as cur:
            cur.execute(SQL_BLOCKED_BY, (int(user_id),))
            blocked_by = {str(r[0]) for r in cur.fetchall()}

        excluded_authors: Set[str] = user_blocked | blocked_by

        # ---- 1) candidate generation ----
        candidate_ids = generate_post_candidates(
            conn=conn,
            user_id=str(user_id),
            viewer=viewer,
            user_friends=user_friends,
            excluded_authors=excluded_authors,
        )
        if not candidate_ids:
            return []

        candidate_ints = [int(pid) for pid in candidate_ids]

        # ---- fetch post rows in bulk ----
        sql_get_posts_bulk = """
        SELECT
          p.postid,
          p.user_id AS author_id,
          COALESCE(p.location_str, '') AS coarse_location,
          p.time_posted,
          COALESCE(p.post_content, '') AS post_content
        FROM posts p
        WHERE p.postid = ANY(%s);
        """
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql_get_posts_bulk, (candidate_ints,))
            post_rows = cur.fetchall()

        if not post_rows:
            return []

        # map posts by id for determinism and quick lookup
        posts_by_id: Dict[str, Dict[str, Any]] = {str(r["postid"]): r for r in post_rows}

        # ---- author rows in bulk ----
        author_ids = sorted({int(r["author_id"]) for r in post_rows})
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_GET_AUTHORS, (author_ids,))
            author_rows = cur.fetchall()

        authors_by_id: Dict[str, Dict[str, Any]] = {str(r["userid"]): r for r in author_rows}

        # ---- RSVP friend counts (optional) ----
        friend_rsvp_count_by_post: Dict[str, int] = {}
        if user_friends and _table_exists(conn, "postrsvps"):
            friends_int = [int(x) for x in user_friends]
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(SQL_RSVP_FRIEND_COUNT_FOR_POSTS, (friends_int, candidate_ints))
                for r in cur.fetchall():
                    friend_rsvp_count_by_post[str(r["post_id"])] = int(r["friend_rsvp_count"])

        # ---- 2) score ----
        scored: List[ScoredCandidate] = []
        for pid_str in candidate_ids:
            post = posts_by_id.get(pid_str)
            if not post:
                continue
            author = authors_by_id.get(str(post["author_id"]))
            if not author:
                continue

            score = score_post(
                viewer=viewer,
                post_row=post,
                author_row=author,
                user_friends=user_friends,
                friend_rsvp_count=friend_rsvp_count_by_post.get(pid_str, 0),
            )
            scored.append(ScoredCandidate(
                id=pid_str,
                score=score,
                author_id=str(post["author_id"]),
            ))

        # sort for determinism before reranking
        scored.sort(key=lambda x: (-x.score, x.id))

        # ---- 3) rerank ----
        reranked = rerank_posts(str(user_id), scored, limit)

        # ---- 4) build response ----
        results: List[int] = []
        for sc in reranked:
            post = posts_by_id.get(sc.id)
            if not post:
                continue
            author = authors_by_id.get(str(post["author_id"]))
            if not author:
                continue

            results.append(post["postid"])

        return results

    finally:
        conn.close()


if __name__ == "__main__":
    limit_env = os.getenv("EVENT_RECS_LIMIT", "30")
    try:
        limit = int(limit_env)
    except ValueError:
        limit = 30

    test_user_id = 482193
    print(recommend_posts(user_id=test_user_id,limit=limit))
    print("Stored event recommendations into users.event_recs_dis")