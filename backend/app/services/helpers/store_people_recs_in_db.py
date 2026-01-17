"""
Persist deterministic PEOPLE recommendations into users.people_recs (JSONB[])

python -m app.services.helpers.store_people_recs_in_db
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor, Json

from app.services.helpers.similarity_helpers import (
    jaccard,
    language_score,
    location_score,
    mutual_friends_score,  # we will provide friends sets from DB
    culture_score,
)

from app.state import get_people_impression_store, ImpressionStore


# diversity constraints (same as your algorithm)
MAX_SAME_PRIMARY_CULTURE = 6
MAX_SAME_PRIMARY_LANGUAGE = 8
NEW_USER_WINDOW_DAYS = 14
NEW_USER_BOOST = 0.03


@dataclass
class ScoredCandidate:
    id: str
    score: float
    primary_culture: Optional[str] = None
    primary_language: Optional[str] = None


# ----------------------------
# SQL helpers (candidate gen)
# ----------------------------

SQL_GET_VIEWER = """
SELECT
  userid,
  age,
  currentCity,
  travelingTo,
  languages,
  culturalIdentity,
  lookingFor,
  Friends,
  BlockedUsers,
  verifiedStudentsOnly
FROM users
WHERE userid = %s;
"""

# users who have blocked viewer: their Blocked array contains viewer_id
SQL_BLOCKED_BY = """
SELECT userid
FROM users
WHERE %s = ANY(COALESCE(BlockedUsers, ARRAY[]::int[]));
"""

# 1) Friends-of-friends candidates
# - unnest viewer friends
# - join their friends
# - exclude self + viewer friends + viewer blocked + blocked_by
SQL_FOF_CANDIDATES = """
WITH
viewer AS (
  SELECT
    userid,
    COALESCE(Friends, ARRAY[]::int[]) AS Friends,
    COALESCE(BlockedUsers, ARRAY[]::int[]) AS BlockedUsers
  FROM users
  WHERE userid = %s
),
blocked_by AS (
  SELECT userid
  FROM users
  WHERE %s = ANY(COALESCE(BlockedUsers, ARRAY[]::int[]))
),
fof AS (
  SELECT DISTINCT
    f2 AS candidate_id,
    v.userid AS viewer_id,
    v.Friends AS viewer_friends,
    v.BlockedUsers AS viewer_blocked
  FROM viewer v
  CROSS JOIN LATERAL unnest(v.Friends) AS f1
  JOIN users u1 ON u1.userid = f1
  CROSS JOIN LATERAL unnest(COALESCE(u1.Friends, ARRAY[]::int[])) AS f2
)
SELECT candidate_id
FROM fof
WHERE candidate_id <> viewer_id
  AND NOT (candidate_id = ANY(viewer_friends))
  AND NOT (candidate_id = ANY(viewer_blocked))
  AND candidate_id NOT IN (SELECT userid FROM blocked_by);
"""

# 2) Location-based candidates (same currentCity/travelingTo patterns)
SQL_LOCATION_CANDIDATES = """
WITH viewer AS (
  SELECT userid, currentCity, travelingTo,
         COALESCE(Friends, ARRAY[]::int[]) AS Friends,
         COALESCE(BlockedUsers, ARRAY[]::int[]) AS BlockedUsers
  FROM users
  WHERE userid = %s
),
blocked_by AS (
  SELECT userid
  FROM users
  WHERE %s = ANY(COALESCE(BlockedUsers, ARRAY[]::int[]))
)
SELECT u.userid AS candidate_id
FROM users u, viewer v
WHERE u.userid <> v.userid
  AND u.userid <> ALL(v.Friends)
  AND u.userid <> ALL(v.BlockedUsers)
  AND u.userid NOT IN (SELECT userid FROM blocked_by)
  AND (
    u.currentCity = v.currentCity
    OR (v.travelingTo IS NOT NULL AND u.currentCity = v.travelingTo)
    OR (u.travelingTo IS NOT NULL AND u.travelingTo = v.currentCity)
    OR (v.travelingTo IS NOT NULL AND u.travelingTo = v.travelingTo)
  );
"""

# 3) Attribute overlap candidates (goals/languages/culture overlaps)
# Using array overlap operator && for TEXT[].
SQL_OVERLAP_CANDIDATES = """
WITH viewer AS (
  SELECT userid,
         COALESCE(lookingFor, ARRAY[]::text[]) AS goals,
         COALESCE(languages, ARRAY[]::text[]) AS langs,
         COALESCE(culturalIdentity, ARRAY[]::text[]) AS cultures,
         COALESCE(Friends, ARRAY[]::int[]) AS Friends,
         COALESCE(BlockedUsers, ARRAY[]::int[]) AS BlockedUsers
  FROM users
  WHERE userid = %s
),
blocked_by AS (
  SELECT userid
  FROM users
  WHERE %s = ANY(COALESCE(BlockedUsers, ARRAY[]::int[]))
)
SELECT u.userid AS candidate_id
FROM users u, viewer v
WHERE u.userid <> v.userid
  AND u.userid <> ALL(v.Friends)
  AND u.userid <> ALL(v.BlockedUsers)
  AND u.userid NOT IN (SELECT userid FROM blocked_by)
  AND (
    COALESCE(u.lookingFor, ARRAY[]::text[]) && v.goals
    OR COALESCE(u.languages, ARRAY[]::text[]) && v.langs
    OR COALESCE(u.culturalIdentity, ARRAY[]::text[]) && v.cultures
  );
"""

SQL_GET_CANDIDATE_ROWS = """
SELECT
  userid,
  age,
  currentCity,
  travelingTo,
  COALESCE(languages, ARRAY[]::text[]) AS languages,
  COALESCE(culturalIdentity, ARRAY[]::text[]) AS culturalIdentity,
  COALESCE(lookingFor, ARRAY[]::text[]) AS lookingFor,
  COALESCE(Friends, ARRAY[]::int[]) AS Friends
FROM users
WHERE userid = ANY(%s);
"""

SQL_UPDATE_PEOPLE_RECS = """
UPDATE users
SET people_recs = %s
WHERE userid = %s;
"""


# ----------------------------
# Score + rerank 
# ----------------------------

def _score_person_from_rows(viewer: Dict[str, Any], cand: Dict[str, Any], friends_map: Dict[int, set[int]]) -> float:
    """
    Compute the deterministic recommendation score between a viewer and a candidate user.

    Inputs:
        viewer: Dict[str, Any]
            The user we're generating recs for, with info like userid, currentcity, travelingto, languages,
            culturalidentity, lookingfor, friends.

        cand: Dict[str, Any]
            A single user row, representing the candidate.

        friends_map: Dict[int, set[int]]
            Mapping of user_id -> set of friend user_ids for viewer and all candidates.
            Used to compute mutual friends score.

    Output:
        float
            Final weighted compatibility score between viewer and candidate.
    """
    # map demo fields to DB fields
    viewer_city = viewer["currentcity"]
    viewer_dest = viewer["travelingto"]
    cand_city = cand["currentcity"]
    cand_dest = cand["travelingto"]

    loc = location_score(viewer_city, viewer_dest, cand_city, cand_dest)

    goals = jaccard(viewer["lookingfor"], cand["lookingfor"])
    culture = culture_score(viewer["culturalidentity"], cand["culturalidentity"])
    lang = language_score(viewer["languages"], cand["languages"])

    # mutual friends
    viewer_id = str(viewer["userid"])
    cand_id = str(cand["userid"])

    # convert friends_map to the structure mutual_friends_score expects: dict[str,set[str]]
    friends_for_algo: Dict[str, set[str]] = {
        str(uid): {str(x) for x in s} for uid, s in friends_map.items()
    }
    mutual = mutual_friends_score(viewer_id, cand_id, friends_for_algo)

    # you also don't have verified_student in schema; using verifiedStudentsOnly is a preference.
    verified_bonus = 0.0

    score = (
        0.30 * loc +
        0.25 * goals +
        0.20 * culture +
        0.15 * lang +
        0.05 * mutual +
        verified_bonus
    )
    return float(score)


def _rerank_people(
    viewer_id: str,
    scored: List[ScoredCandidate],
    impression_store: ImpressionStore,
    candidate_rows_by_id: Dict[str, Dict[str, Any]],
    limit: int,
) -> List[ScoredCandidate]:
    """
     Apply fairness/diversity and anti-repeat logic to a list of scored candidates.

    Inputs:
        viewer_id: str
            ID of the user receiving recommendations.

        scored: List[ScoredCandidate]
            List of candidates with base scores (before reranking).

        impression_store: ImpressionStore
            Tracks which candidates were recently shown to apply penalties.

        candidate_rows_by_id: Dict[str, Dict[str, Any]]
            Mapping from candidate user_id (string) to DB row dict.

        limit: int
            Maximum number of recommendations to return.

    Output:
        List[ScoredCandidate]
            Final reranked list of candidates, respecting diversity constraints.
    """
    now = datetime.now()
    adjusted: List[ScoredCandidate] = []

    for sc in scored:
        cand = candidate_rows_by_id.get(sc.id)
        if not cand:
            continue

        score = sc.score

        # impression penalties
        if impression_store.is_recently_shown(viewer_id, sc.id, within_last_n=50):
            score -= 0.05
        elif impression_store.was_shown_within_days(viewer_id, sc.id, days=7):
            score -= 0.02

        # primary culture/language from DB arrays
        cultures = cand.get("culturalidentity") or []
        langs = cand.get("languages") or []
        primary_culture = cultures[0] if len(cultures) > 0 else None
        primary_language = langs[0] if len(langs) > 0 else None

        adjusted.append(ScoredCandidate(
            id=sc.id,
            score=score,
            primary_culture=primary_culture,
            primary_language=primary_language,
        ))

    adjusted.sort(key=lambda x: (-x.score, x.id))

    result: List[ScoredCandidate] = []
    culture_counts: Dict[str, int] = {}
    language_counts: Dict[str, int] = {}

    for sc in adjusted:
        if len(result) >= limit:
            break

        if sc.primary_culture:
            if culture_counts.get(sc.primary_culture, 0) >= MAX_SAME_PRIMARY_CULTURE:
                continue

        if sc.primary_language:
            if language_counts.get(sc.primary_language, 0) >= MAX_SAME_PRIMARY_LANGUAGE:
                continue

        result.append(sc)
        if sc.primary_culture:
            culture_counts[sc.primary_culture] = culture_counts.get(sc.primary_culture, 0) + 1
        if sc.primary_language:
            language_counts[sc.primary_language] = language_counts.get(sc.primary_language, 0) + 1

    return result


# ----------------------------
# Public API: store people recs for all users
# ----------------------------

def store_people_recs(conn: psycopg2.extensions.connection, limit: int = 50) -> None:
    """
    For EACH user in the DB:
      - generate candidates via SQL (FOF + location + overlap)
      - score + rerank using the same deterministic rules
      - store users.people_recs = JSONB[] (userid + score + tags + mutual friends)
    """
    impression_store = get_people_impression_store()

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT userid FROM users;")
        user_ids = [row["userid"] for row in cur.fetchall()]

    for uid in user_ids:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_GET_VIEWER, (uid,))
            viewer = cur.fetchone()

        if not viewer:
            continue

        viewer_id_str = str(uid)

        # candidate generation via SQL
        with conn.cursor() as cur:
            cur.execute(SQL_FOF_CANDIDATES, (uid, uid))
            fof = {r[0] for r in cur.fetchall()}

            cur.execute(SQL_LOCATION_CANDIDATES, (uid, uid))
            loc = {r[0] for r in cur.fetchall()}

            cur.execute(SQL_OVERLAP_CANDIDATES, (uid, uid))
            ovl = {r[0] for r in cur.fetchall()}

        candidate_ids = list(fof | loc | ovl)
        if not candidate_ids:
            continue

        # fetch candidate rows (bulk)
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL_GET_CANDIDATE_ROWS, (candidate_ids,))
            candidate_rows = cur.fetchall()

        # build friends map for mutual friends scoring
        friends_map: Dict[int, set[int]] = {}
        friends_map[int(uid)] = set(viewer.get("friends") or [])
        for r in candidate_rows:
            friends_map[int(r["userid"])] = set(r.get("friends") or [])

        candidate_rows_by_id = {str(r["userid"]): r for r in candidate_rows}

        # score each candidate
        scored: List[ScoredCandidate] = []
        for r in candidate_rows:
            cid = str(r["userid"])
            s = _score_person_from_rows(viewer, r, friends_map)
            scored.append(ScoredCandidate(id=cid, score=s))

        scored.sort(key=lambda x: (-x.score, x.id))

        # rerank (fairness/diversity)
        reranked = _rerank_people(
            viewer_id=viewer_id_str,
            scored=scored,
            impression_store=impression_store,
            candidate_rows_by_id=candidate_rows_by_id,
            limit=limit,
        )

        # serialize to JSONB[] payload
        payload: List[Dict[str, Any]] = []
        viewer_friends = friends_map[int(uid)]

        for sc in reranked:
            cand = candidate_rows_by_id.get(sc.id)
            if not cand:
                continue

            cand_friends = friends_map.get(int(sc.id), set())
            mutual_count = len(viewer_friends & cand_friends)

            tags: List[str] = []
            tags.extend((cand.get("lookingfor") or [])[:2])
            tags.extend((cand.get("languages") or [])[:2])
            tags.extend((cand.get("culturalidentity") or [])[:2])
            tags = tags[:6]

            payload.append({
                "userid": int(sc.id),
                "mutual_friends_count": mutual_count,
                "tags": tags,
                "score": sc.score,
            })

            impression_store.record_impression(viewer_id_str, sc.id)

        with conn.cursor() as cur:
            cur.execute(SQL_UPDATE_PEOPLE_RECS, (Json(payload), int(uid)))
        conn.commit()


if __name__ == "__main__":
    import os
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "hacks13"),
        user=os.getenv("DB_USER", "jennifer"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )

    store_people_recs(conn)
    print("Stored people recommendations")
    """
    test_user_id = 482193
    recs = get_people_recs(conn, test_user_id, limit=10)
    
    print("Top 10 recommended people IDs:", recs)
    """

    conn.close()