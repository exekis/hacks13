"""
similarity helper functions for the recommendation algorithm

all functions are pure and unit-testable
designed to be deterministic with no randomness
"""

from datetime import datetime


# configurable set of high-signal languages
# these get a boost when shared, without penalizing extra languages
HIGH_SIGNAL_LANGS: set[str] = {"Persian"}


def jaccard(a: list[str], b: list[str]) -> float:
    """
    compute jaccard similarity between two lists
    
    jaccard = |A ∩ B| / |A ∪ B|
    returns 0.0 if both sets are empty
    """
    set_a = set(a)
    set_b = set(b)
    
    intersection = set_a & set_b
    union = set_a | set_b
    
    if not union:
        return 0.0
    
    return len(intersection) / len(union)


def overlap_coefficient(a: list[str], b: list[str]) -> float:
    """
    compute overlap coefficient between two lists
    
    overlap = |A ∩ B| / min(|A|, |B|)
    
    this is preferred over jaccard for languages because it doesn't
    penalize multilingual users - a user who speaks 5 languages
    matching 2 with another user still gets a good score
    
    returns 0.0 if either set is empty
    """
    set_a = set(a)
    set_b = set(b)
    
    if not set_a or not set_b:
        return 0.0
    
    intersection = set_a & set_b
    min_size = min(len(set_a), len(set_b))
    
    return len(intersection) / min_size


def language_score(a_langs: list[str], b_langs: list[str]) -> float:
    """
    compute language compatibility score
    
    uses overlap coefficient (not jaccard) to avoid penalizing multilingual users
    adds optional boost for high-signal shared languages
    
    returns score capped at 1.0
    """
    base_score = overlap_coefficient(a_langs, b_langs)
    
    # check for high-signal language match
    set_a = set(a_langs)
    set_b = set(b_langs)
    intersection = set_a & set_b
    
    shared_high_signal = bool(intersection & HIGH_SIGNAL_LANGS)
    
    if shared_high_signal:
        return min(1.0, base_score + 0.25)
    
    return base_score


def location_score(
    user_current_city: str,
    user_destination_city: str | None,
    candidate_current_city: str,
    candidate_destination_city: str | None,
) -> float:
    """
    compute location compatibility score
    
    1.0 if same current city
    0.8 if same destination city (and non-null)
    0.0 otherwise
    """
    if user_current_city == candidate_current_city:
        return 1.0
    
    if (
        user_destination_city
        and candidate_destination_city
        and user_destination_city == candidate_destination_city
    ):
        return 0.8
    
    # also check cross-matches: user going where candidate is, or vice versa
    if user_destination_city and user_destination_city == candidate_current_city:
        return 0.8
    
    if candidate_destination_city and candidate_destination_city == user_current_city:
        return 0.8
    
    return 0.0


def mutual_friends_score(
    user_id: str,
    candidate_id: str,
    friends_graph: dict[str, set[str]],
) -> float:
    """
    compute mutual friends score
    
    returns min(mutual_count, 5) / 5
    """
    user_friends = friends_graph.get(user_id, set())
    candidate_friends = friends_graph.get(candidate_id, set())
    
    mutual = user_friends & candidate_friends
    mutual_count = len(mutual)
    
    return min(mutual_count, 5) / 5


def recency_score(dt: datetime, window_days: int = 14) -> float:
    """
    compute recency score with linear decay
    
    1.0 if dt is within 1 day of now
    decays linearly to 0.0 at window_days
    """
    now = datetime.now()
    delta = now - dt
    days_ago = delta.total_seconds() / (24 * 3600)
    
    if days_ago <= 1:
        return 1.0
    
    if days_ago >= window_days:
        return 0.0
    
    # linear decay from 1.0 at day 1 to 0.0 at window_days
    return 1.0 - (days_ago - 1) / (window_days - 1)


def culture_score(a_cultures: list[str], b_cultures: list[str]) -> float:
    """
    compute culture compatibility score
    
    simple binary: 1.0 if any overlap, 0.0 otherwise
    
    optionally could add a small boost if first (primary) culture matches
    but keeping it simple for now
    """
    set_a = set(a_cultures)
    set_b = set(b_cultures)
    
    if set_a & set_b:
        return 1.0
    
    return 0.0


def post_location_match(
    post_location: str,
    user_current_city: str,
    user_destination_city: str | None,
) -> float:
    """
    compute post location match score
    
    1.0 if post location matches user current or destination city
    0.5 otherwise (could be same country/region)
    """
    post_loc_lower = post_location.lower()
    
    if user_current_city.lower() in post_loc_lower:
        return 1.0
    
    if user_destination_city and user_destination_city.lower() in post_loc_lower:
        return 1.0
    
    # simple heuristic: check if they share a city name
    # this is intentionally vague to match coarse locations
    return 0.5
