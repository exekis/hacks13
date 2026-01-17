"""
recommendation service for travelmate

implements deterministic, fair recommendation algorithm
no external apis, no embeddings, no heavy ml
"""

from datetime import datetime, timedelta
from dataclasses import dataclass

from app.models.recommendation import UserProfile, Post, PersonRecommendation, PostRecommendation
from app.data.demo import get_demo_state, DemoState
from app.services.candidate_generation.similarity_helpers import (
    jaccard,
    language_score,
    location_score,
    mutual_friends_score,
    recency_score,
    culture_score,
    post_location_match,
)
from app.state import (
    get_people_impression_store,
    get_post_impression_store,
    ImpressionStore,
)


# diversity constraints
MAX_SAME_PRIMARY_CULTURE = 6
MAX_SAME_PRIMARY_LANGUAGE = 8
MAX_POSTS_SAME_AUTHOR = 3

# new user boost window
NEW_USER_WINDOW_DAYS = 14
NEW_USER_BOOST = 0.03


@dataclass
class ScoredCandidate:
    """intermediate representation with score"""
    id: str
    score: float
    primary_culture: str | None = None
    primary_language: str | None = None
    author_id: str | None = None  # for posts


# ---------------------------------------------------------------------------
# candidate generation
# ---------------------------------------------------------------------------

def generate_people_candidates(
    user_id: str,
    state: DemoState,
) -> list[str]:
    """
    generate candidate user ids for people recommendations
    
    candidates come from:
    1. friends-of-friends (fof)
    2. users in same current_city or same destination_city
    3. users sharing any overlap in goals, languages, or cultural_backgrounds
    
    excludes:
    - self
    - current friends
    - blocked users
    - users who blocked the viewer
    """
    users = state["users"]
    friends = state["friends"]
    blocks = state["blocks"]
    
    if user_id not in users:
        return []
    
    user = users[user_id]
    user_friends = friends.get(user_id, set())
    user_blocks = blocks.get(user_id, set())
    
    # find users who blocked the viewer
    blocked_by = {
        uid for uid, blocked_set in blocks.items()
        if user_id in blocked_set
    }
    
    excluded = {user_id} | user_friends | user_blocks | blocked_by
    
    candidates: set[str] = set()
    
    # 1. friends of friends
    for friend_id in user_friends:
        friend_friends = friends.get(friend_id, set())
        candidates.update(friend_friends - excluded)
    
    # 2. same city or destination
    for uid, u in users.items():
        if uid in excluded:
            continue
        
        if u.current_city == user.current_city:
            candidates.add(uid)
        elif user.destination_city and u.current_city == user.destination_city:
            candidates.add(uid)
        elif u.destination_city and u.destination_city == user.current_city:
            candidates.add(uid)
        elif (
            user.destination_city
            and u.destination_city
            and u.destination_city == user.destination_city
        ):
            candidates.add(uid)
    
    # 3. shared goals, languages, or cultural backgrounds
    user_goals = set(user.goals)
    user_langs = set(user.languages)
    user_cultures = set(user.cultural_backgrounds)
    
    for uid, u in users.items():
        if uid in excluded:
            continue
        
        if user_goals & set(u.goals):
            candidates.add(uid)
        elif user_langs & set(u.languages):
            candidates.add(uid)
        elif user_cultures & set(u.cultural_backgrounds):
            candidates.add(uid)
    
    return list(candidates)


def generate_post_candidates(
    user_id: str,
    state: DemoState,
) -> list[str]:
    """
    generate candidate post ids for post recommendations
    
    candidates come from:
    1. posts by friends
    2. posts liked by friends
    3. posts by fof and in same city/destination
    
    excludes:
    - posts whose author is blocked by user
    - posts whose author has blocked user
    """
    users = state["users"]
    posts = state["posts"]
    friends = state["friends"]
    blocks = state["blocks"]
    likes = state["likes"]
    
    if user_id not in users:
        return []
    
    user = users[user_id]
    user_friends = friends.get(user_id, set())
    user_blocks = blocks.get(user_id, set())
    
    # find users who blocked the viewer
    blocked_by = {
        uid for uid, blocked_set in blocks.items()
        if user_id in blocked_set
    }
    
    excluded_authors = user_blocks | blocked_by
    
    candidates: set[str] = set()
    
    # 1. posts by friends
    for post_id, post in posts.items():
        if post.author_id in user_friends and post.author_id not in excluded_authors:
            candidates.add(post_id)
    
    # 2. posts liked by friends
    for post_id, likers in likes.items():
        if post_id not in posts:
            continue
        post = posts[post_id]
        if post.author_id in excluded_authors:
            continue
        
        friends_who_liked = likers & user_friends
        if friends_who_liked:
            candidates.add(post_id)
    
    # 3. posts by fof in same city/destination
    fof: set[str] = set()
    for friend_id in user_friends:
        friend_friends = friends.get(friend_id, set())
        fof.update(friend_friends - {user_id} - user_friends)
    
    for post_id, post in posts.items():
        if post.author_id in excluded_authors:
            continue
        if post.author_id not in fof:
            continue
        
        # check city match
        post_loc_lower = post.coarse_location.lower()
        if (
            user.current_city.lower() in post_loc_lower
            or (user.destination_city and user.destination_city.lower() in post_loc_lower)
        ):
            candidates.add(post_id)
    
    return list(candidates)


# ---------------------------------------------------------------------------
# hard filters
# ---------------------------------------------------------------------------

def apply_people_hard_filters(
    user_id: str,
    candidate_ids: list[str],
    state: DemoState,
) -> list[str]:
    """
    apply hard filters to people candidates
    
    - age preference: if enabled, only within +/- 5 years
    - verified only: if enabled, only verified_student and age_verified
    """
    users = state["users"]
    
    if user_id not in users:
        return []
    
    user = users[user_id]
    filtered = []
    
    for cid in candidate_ids:
        if cid not in users:
            continue
        
        candidate = users[cid]
        
        # age filter
        if user.prefer_near_age:
            age_diff = abs(user.age - candidate.age)
            if age_diff > 5:
                continue
        
        # verified filter
        if user.verified_only:
            if not (candidate.verified_student and candidate.age_verified):
                continue
        
        filtered.append(cid)
    
    return filtered


# ---------------------------------------------------------------------------
# scoring
# ---------------------------------------------------------------------------

def score_person(
    user_id: str,
    candidate_id: str,
    state: DemoState,
) -> float:
    """
    compute deterministic score for a person candidate
    
    score =
      0.30 * location_score +
      0.25 * jaccard(goals) +
      0.20 * culture_score +
      0.15 * language_score +
      0.05 * mutual_friends_score +
      0.05 * recency_score(last_active_at) +
      0.05 if verified_student
    """
    users = state["users"]
    friends = state["friends"]
    
    user = users[user_id]
    candidate = users[candidate_id]
    
    loc = location_score(
        user.current_city,
        user.destination_city,
        candidate.current_city,
        candidate.destination_city,
    )
    
    goals = jaccard(user.goals, candidate.goals)
    
    culture = culture_score(
        user.cultural_backgrounds,
        candidate.cultural_backgrounds,
    )
    
    lang = language_score(user.languages, candidate.languages)
    
    mutual = mutual_friends_score(user_id, candidate_id, friends)
    
    recent = recency_score(candidate.last_active_at)
    
    verified_bonus = 0.05 if candidate.verified_student else 0.0
    
    score = (
        0.30 * loc +
        0.25 * goals +
        0.20 * culture +
        0.15 * lang +
        0.05 * mutual +
        0.05 * recent +
        verified_bonus
    )
    
    return score


def score_post(
    user_id: str,
    post_id: str,
    state: DemoState,
) -> float:
    """
    compute deterministic score for a post candidate
    
    score =
      0.35 * friend_author +
      0.20 * liked_by_friends_norm +
      0.20 * location_match +
      0.15 * goals_match +
      0.10 * post_recency +
      0.05 if author.verified_student
    """
    users = state["users"]
    posts = state["posts"]
    friends = state["friends"]
    likes = state["likes"]
    
    user = users[user_id]
    post = posts[post_id]
    author = users.get(post.author_id)
    
    if not author:
        return 0.0
    
    user_friends = friends.get(user_id, set())
    
    # friend author
    friend_author = 1.0 if post.author_id in user_friends else 0.0
    
    # liked by friends
    post_likers = likes.get(post_id, set())
    friends_who_liked = post_likers & user_friends
    liked_norm = min(len(friends_who_liked), 5) / 5
    
    # location match
    loc_match = post_location_match(
        post.coarse_location,
        user.current_city,
        user.destination_city,
    )
    
    # goals match
    goals_match = jaccard(user.goals, post.tags)
    
    # recency
    recent = recency_score(post.created_at)
    
    # verified bonus
    verified_bonus = 0.05 if author.verified_student else 0.0
    
    score = (
        0.35 * friend_author +
        0.20 * liked_norm +
        0.20 * loc_match +
        0.15 * goals_match +
        0.10 * recent +
        verified_bonus
    )
    
    return score


# ---------------------------------------------------------------------------
# reranking for fairness and diversity
# ---------------------------------------------------------------------------

def rerank_people(
    user_id: str,
    scored: list[ScoredCandidate],
    impression_store: ImpressionStore,
    limit: int,
    state: DemoState,
) -> list[ScoredCandidate]:
    """
    apply fairness/diversity reranking to people candidates
    
    constraints:
    - max 6 results with same primary cultural background
    - max 8 results with same primary language
    - penalty for recently shown candidates
    - boost for new users
    """
    users = state["users"]
    
    # apply new user boost and impression penalty first
    now = datetime.now()
    adjusted = []
    
    for sc in scored:
        candidate = users.get(sc.id)
        if not candidate:
            continue
        
        score = sc.score
        
        # new user boost
        days_since_created = (now - candidate.created_at).total_seconds() / (24 * 3600)
        if days_since_created <= NEW_USER_WINDOW_DAYS:
            score += NEW_USER_BOOST
        
        # impression penalty
        if impression_store.is_recently_shown(user_id, sc.id, within_last_n=50):
            score -= 0.05
        elif impression_store.was_shown_within_days(user_id, sc.id, days=7):
            score -= 0.02
        
        # extract primary culture and language
        primary_culture = candidate.cultural_backgrounds[0] if candidate.cultural_backgrounds else None
        primary_language = candidate.languages[0] if candidate.languages else None
        
        adjusted.append(ScoredCandidate(
            id=sc.id,
            score=score,
            primary_culture=primary_culture,
            primary_language=primary_language,
        ))
    
    # sort by adjusted score descending
    adjusted.sort(key=lambda x: -x.score)
    
    # apply diversity constraints
    result = []
    culture_counts: dict[str, int] = {}
    language_counts: dict[str, int] = {}
    
    for sc in adjusted:
        if len(result) >= limit:
            break
        
        # check culture cap
        if sc.primary_culture:
            current_count = culture_counts.get(sc.primary_culture, 0)
            if current_count >= MAX_SAME_PRIMARY_CULTURE:
                continue
        
        # check language cap
        if sc.primary_language:
            current_count = language_counts.get(sc.primary_language, 0)
            if current_count >= MAX_SAME_PRIMARY_LANGUAGE:
                continue
        
        # add to result
        result.append(sc)
        
        if sc.primary_culture:
            culture_counts[sc.primary_culture] = culture_counts.get(sc.primary_culture, 0) + 1
        if sc.primary_language:
            language_counts[sc.primary_language] = language_counts.get(sc.primary_language, 0) + 1
    
    return result


def rerank_posts(
    user_id: str,
    scored: list[ScoredCandidate],
    impression_store: ImpressionStore,
    limit: int,
) -> list[ScoredCandidate]:
    """
    apply fairness/diversity reranking to post candidates
    
    constraints:
    - max 3 posts from same author in top results
    - penalty for recently shown posts
    """
    # apply impression penalty
    adjusted = []
    
    for sc in scored:
        score = sc.score
        
        # impression penalty
        if impression_store.is_recently_shown(user_id, sc.id, within_last_n=50):
            score -= 0.05
        elif impression_store.was_shown_within_days(user_id, sc.id, days=7):
            score -= 0.02
        
        adjusted.append(ScoredCandidate(
            id=sc.id,
            score=score,
            author_id=sc.author_id,
        ))
    
    # sort by adjusted score descending
    adjusted.sort(key=lambda x: -x.score)
    
    # apply author diversity constraint
    result = []
    author_counts: dict[str, int] = {}
    
    for sc in adjusted:
        if len(result) >= limit:
            break
        
        # check author cap
        if sc.author_id:
            current_count = author_counts.get(sc.author_id, 0)
            if current_count >= MAX_POSTS_SAME_AUTHOR:
                continue
            author_counts[sc.author_id] = current_count + 1
        
        result.append(sc)
    
    return result


# ---------------------------------------------------------------------------
# main recommendation functions
# ---------------------------------------------------------------------------

def recommend_people(
    user_id: str,
    limit: int = 20,
    debug: bool = False,
    record_impressions: bool = True,
) -> list[PersonRecommendation]:
    """
    get people recommendations for a user
    
    deterministic algorithm:
    1. generate candidates (fof, same city, shared attributes)
    2. apply hard filters (age, verified)
    3. score each candidate
    4. rerank for diversity and anti-repeat
    5. return top limit
    """
    state = get_demo_state()
    users = state["users"]
    friends = state["friends"]
    
    if user_id not in users:
        return []
    
    # 1. generate candidates
    candidate_ids = generate_people_candidates(user_id, state)
    
    # 2. apply hard filters
    filtered_ids = apply_people_hard_filters(user_id, candidate_ids, state)
    
    # 3. score
    scored = []
    for cid in filtered_ids:
        score = score_person(user_id, cid, state)
        scored.append(ScoredCandidate(id=cid, score=score))
    
    # sort for determinism before reranking
    scored.sort(key=lambda x: (-x.score, x.id))
    
    # 4. rerank
    impression_store = get_people_impression_store()
    reranked = rerank_people(user_id, scored, impression_store, limit, state)
    
    # 5. build response
    user = users[user_id]
    user_friends = friends.get(user_id, set())
    results = []
    
    for sc in reranked:
        candidate = users[sc.id]
        
        # compute mutual friends
        candidate_friends = friends.get(sc.id, set())
        mutual_count = len(user_friends & candidate_friends)
        
        # build tags (up to 6 combined)
        tags = []
        tags.extend(candidate.goals[:2])
        tags.extend(candidate.languages[:2])
        tags.extend(candidate.cultural_backgrounds[:2])
        tags = tags[:6]
        
        rec = PersonRecommendation(
            id=candidate.id,
            display_name=candidate.display_name,
            avatar_url=candidate.avatar_url,
            bio=candidate.bio,
            verified_student=candidate.verified_student,
            age_verified=candidate.age_verified,
            tags=tags,
            mutual_friends_count=mutual_count,
            location_hidden=True,
            debug_score=sc.score if debug else None,
        )
        results.append(rec)
        
        # record impression
        if record_impressions:
            impression_store.record_impression(user_id, sc.id)
    
    return results


def recommend_posts(
    user_id: str,
    limit: int = 30,
    debug: bool = False,
    record_impressions: bool = True,
) -> list[PostRecommendation]:
    """
    get post recommendations for a user
    
    deterministic algorithm:
    1. generate candidates (friend posts, liked by friends, fof posts)
    2. score each candidate
    3. rerank for diversity and anti-repeat
    4. return top limit
    """
    state = get_demo_state()
    users = state["users"]
    posts = state["posts"]
    friends = state["friends"]
    likes = state["likes"]
    
    if user_id not in users:
        return []
    
    # 1. generate candidates
    candidate_ids = generate_post_candidates(user_id, state)
    
    # 2. score
    scored = []
    for pid in candidate_ids:
        if pid not in posts:
            continue
        post = posts[pid]
        score = score_post(user_id, pid, state)
        scored.append(ScoredCandidate(id=pid, score=score, author_id=post.author_id))
    
    # sort for determinism before reranking
    scored.sort(key=lambda x: (-x.score, x.id))
    
    # 3. rerank
    impression_store = get_post_impression_store()
    reranked = rerank_posts(user_id, scored, impression_store, limit)
    
    # 4. build response
    user_friends = friends.get(user_id, set())
    results = []
    
    for sc in reranked:
        post = posts[sc.id]
        author = users.get(post.author_id)
        
        if not author:
            continue
        
        # liked by friends count
        post_likers = likes.get(sc.id, set())
        friends_who_liked = post_likers & user_friends
        
        # date range
        date_range = None
        if post.start_date or post.end_date:
            date_range = {
                "start_date": post.start_date.isoformat() if post.start_date else None,
                "end_date": post.end_date.isoformat() if post.end_date else None,
            }
        
        rec = PostRecommendation(
            id=post.id,
            author_id=post.author_id,
            author_name=author.display_name,
            author_verified_student=author.verified_student,
            text=post.text,
            image_url=post.image_url,
            coarse_location=post.coarse_location,
            date_range=date_range,
            liked_by_friends_count=len(friends_who_liked),
            debug_score=sc.score if debug else None,
        )
        results.append(rec)
        
        # record impression
        if record_impressions:
            impression_store.record_impression(user_id, sc.id)
    
    return results
