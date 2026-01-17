"""
unit tests for candidate generation and diversity reranking
"""

import pytest

from app.data.demo import get_demo_state, reset_demo_state
from backend.app.services.store_event_recs_in_db_dis import (
    generate_people_candidates,
    generate_post_candidates,
    apply_people_hard_filters,
    rerank_people,
    ScoredCandidate,
)
from app.state import reset_impression_stores, ImpressionStore


@pytest.fixture(autouse=True)
def reset_state():
    """reset demo state and impression stores before each test"""
    reset_demo_state()
    reset_impression_stores()
    yield
    reset_demo_state()
    reset_impression_stores()


class TestCandidateGeneration:
    """tests for candidate generation functions"""
    
    def test_excludes_self(self):
        """candidates should not include the user themselves"""
        state = get_demo_state()
        candidates = generate_people_candidates("user_1", state)
        assert "user_1" not in candidates
    
    def test_excludes_friends(self):
        """candidates should not include existing friends"""
        state = get_demo_state()
        user_friends = state["friends"].get("user_1", set())
        
        candidates = generate_people_candidates("user_1", state)
        
        for friend in user_friends:
            assert friend not in candidates
    
    def test_excludes_blocked(self):
        """candidates should not include blocked users"""
        state = get_demo_state()
        
        # user_2 blocked user_9
        candidates = generate_people_candidates("user_2", state)
        assert "user_9" not in candidates
    
    def test_excludes_blocked_by(self):
        """candidates should not include users who blocked the viewer"""
        state = get_demo_state()
        
        # user_7 blocked user_11
        # so user_11 should not see user_7
        candidates = generate_people_candidates("user_11", state)
        assert "user_7" not in candidates
    
    def test_includes_friends_of_friends(self):
        """candidates should include friends of friends"""
        state = get_demo_state()
        
        # user_1 is friends with user_4
        # user_4 is friends with user_7 and user_10
        # so user_1 should see user_7 and user_10 as candidates
        candidates = generate_people_candidates("user_1", state)
        
        assert "user_7" in candidates
        assert "user_10" in candidates
    
    def test_includes_same_city(self):
        """candidates should include users in same city"""
        state = get_demo_state()
        
        # user_1 is in toronto
        # user_4, user_5, user_7, user_10 are also in toronto
        candidates = generate_people_candidates("user_1", state)
        
        # user_4 and user_5 are friends so excluded
        # user_7 and user_10 should be included
        assert "user_7" in candidates
        assert "user_10" in candidates
    
    def test_includes_shared_goals(self):
        """candidates should include users with shared goals"""
        state = get_demo_state()
        
        # user_1 has goals: Friends, Food buddies, Exploring the city
        # should include other users with these goals
        candidates = generate_people_candidates("user_1", state)
        
        # many users share "Friends" goal
        assert len(candidates) > 0


class TestHardFilters:
    """tests for hard filtering functions"""
    
    def test_age_filter_enabled(self):
        """when prefer_near_age is true, filter to +/- 5 years"""
        state = get_demo_state()
        
        # user_1 is 22 years old with prefer_near_age=True
        # modify a user to be 30 to test filtering
        state["users"]["user_5"].age = 30
        
        candidates = ["user_4", "user_5", "user_7"]  # ages: 25, 30, 24
        
        filtered = apply_people_hard_filters("user_1", candidates, state)
        
        # user_5 (age 30) should be filtered out (diff = 8 > 5)
        assert "user_5" not in filtered
        # user_4 (age 25) should be kept (diff = 3 <= 5)
        assert "user_4" in filtered
        # user_7 (age 24) should be kept (diff = 2 <= 5)
        assert "user_7" in filtered
    
    def test_verified_filter(self):
        """when verified_only is true, filter to verified users only"""
        state = get_demo_state()
        
        # enable verified_only for user_1
        state["users"]["user_1"].verified_only = True
        
        # make user_7 not verified
        state["users"]["user_7"].verified_student = False
        state["users"]["user_7"].age_verified = False
        
        candidates = ["user_4", "user_7", "user_10"]
        
        filtered = apply_people_hard_filters("user_1", candidates, state)
        
        # user_7 should be filtered out
        assert "user_7" not in filtered
        # user_4 and user_10 should be kept
        assert "user_4" in filtered
        assert "user_10" in filtered


class TestDiversityReranking:
    """tests for diversity constraint reranking"""
    
    def test_culture_cap(self):
        """should cap results with same primary culture"""
        state = get_demo_state()
        impression_store = ImpressionStore()
        
        # create scored candidates with same primary culture
        scored = []
        for i in range(10):
            scored.append(ScoredCandidate(
                id=f"candidate_{i}",
                score=1.0 - i * 0.01,
                primary_culture="Indian",
                primary_language="English",
            ))
        
        # need to add these fake users to the state for the function to work
        for i in range(10):
            state["users"][f"candidate_{i}"] = state["users"]["user_1"].model_copy()
            state["users"][f"candidate_{i}"].id = f"candidate_{i}"
            state["users"][f"candidate_{i}"].cultural_backgrounds = ["Indian"]
            state["users"][f"candidate_{i}"].languages = ["English"]
        
        reranked = rerank_people("user_1", scored, impression_store, limit=20, state=state)
        
        # count candidates with indian primary culture
        indian_count = sum(1 for sc in reranked if sc.primary_culture == "Indian")
        
        # should be capped at 6
        assert indian_count <= 6
    
    def test_language_cap(self):
        """should cap results with same primary language"""
        state = get_demo_state()
        impression_store = ImpressionStore()
        
        # create scored candidates with same primary language
        scored = []
        for i in range(12):
            scored.append(ScoredCandidate(
                id=f"candidate_{i}",
                score=1.0 - i * 0.01,
                primary_culture=f"Culture_{i}",  # different cultures
                primary_language="Hindi",
            ))
        
        # add fake users
        for i in range(12):
            state["users"][f"candidate_{i}"] = state["users"]["user_1"].model_copy()
            state["users"][f"candidate_{i}"].id = f"candidate_{i}"
            state["users"][f"candidate_{i}"].cultural_backgrounds = [f"Culture_{i}"]
            state["users"][f"candidate_{i}"].languages = ["Hindi"]
        
        reranked = rerank_people("user_1", scored, impression_store, limit=20, state=state)
        
        # count candidates with hindi primary language
        hindi_count = sum(1 for sc in reranked if sc.primary_language == "Hindi")
        
        # should be capped at 8
        assert hindi_count <= 8
    
    def test_impression_penalty(self):
        """recently shown candidates should be penalized"""
        state = get_demo_state()
        impression_store = ImpressionStore()
        
        # record some impressions
        for _ in range(10):
            impression_store.record_impression("user_1", "user_7")
        
        # create candidates
        scored = [
            ScoredCandidate(id="user_7", score=0.9),
            ScoredCandidate(id="user_10", score=0.85),
        ]
        
        reranked = rerank_people("user_1", scored, impression_store, limit=2, state=state)
        
        # user_10 should now rank higher due to impression penalty on user_7
        assert reranked[0].id == "user_10"
    
    def test_new_user_boost(self):
        """new users should get a score boost"""
        state = get_demo_state()
        impression_store = ImpressionStore()
        
        # user_10 was created 5 days ago (within 14 day window)
        # user_7 was created 100 days ago
        
        scored = [
            ScoredCandidate(id="user_7", score=0.50),
            ScoredCandidate(id="user_10", score=0.48),
        ]
        
        reranked = rerank_people("user_1", scored, impression_store, limit=2, state=state)
        
        # user_10 should get boosted above user_7
        assert reranked[0].id == "user_10"


class TestPostCandidateGeneration:
    """tests for post candidate generation"""
    
    def test_includes_friend_posts(self):
        """should include posts by friends"""
        state = get_demo_state()
        
        # user_1 is friends with user_4, user_5, user_9
        # post_3 is by user_4
        candidates = generate_post_candidates("user_1", state)
        
        assert "post_3" in candidates
    
    def test_includes_liked_by_friends(self):
        """should include posts liked by friends"""
        state = get_demo_state()
        
        # user_1 is friends with user_4, user_5, user_9
        # post_1 is liked by user_4, user_5, user_9
        candidates = generate_post_candidates("user_1", state)
        
        # post_1 is by user_1 themselves but liked by friends
        # it should appear if friends liked it
        assert "post_1" in candidates
    
    def test_excludes_blocked_author(self):
        """should exclude posts by blocked authors"""
        state = get_demo_state()
        
        # add a block relationship for testing
        state["blocks"]["user_1"].add("user_4")
        
        candidates = generate_post_candidates("user_1", state)
        
        # post_3 is by user_4 who is now blocked
        assert "post_3" not in candidates
