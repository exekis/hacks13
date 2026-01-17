"""
unit tests for similarity helper functions
"""

import pytest
from datetime import datetime, timedelta

from app.services.similarity import (
    jaccard,
    overlap_coefficient,
    language_score,
    location_score,
    mutual_friends_score,
    recency_score,
    culture_score,
    HIGH_SIGNAL_LANGS,
)


class TestJaccard:
    """tests for jaccard similarity function"""
    
    def test_identical_lists(self):
        """identical lists should return 1.0"""
        a = ["a", "b", "c"]
        b = ["a", "b", "c"]
        assert jaccard(a, b) == 1.0
    
    def test_no_overlap(self):
        """no overlap should return 0.0"""
        a = ["a", "b", "c"]
        b = ["d", "e", "f"]
        assert jaccard(a, b) == 0.0
    
    def test_partial_overlap(self):
        """partial overlap should return correct ratio"""
        a = ["a", "b", "c"]
        b = ["b", "c", "d"]
        # intersection: {b, c} = 2
        # union: {a, b, c, d} = 4
        assert jaccard(a, b) == 0.5
    
    def test_empty_lists(self):
        """empty lists should return 0.0"""
        assert jaccard([], []) == 0.0
    
    def test_one_empty(self):
        """one empty list should return 0.0"""
        assert jaccard(["a", "b"], []) == 0.0
        assert jaccard([], ["a", "b"]) == 0.0
    
    def test_duplicates_handled(self):
        """duplicates should be handled via set conversion"""
        a = ["a", "a", "b"]
        b = ["a", "b", "b"]
        assert jaccard(a, b) == 1.0


class TestOverlapCoefficient:
    """tests for overlap coefficient function"""
    
    def test_identical_lists(self):
        """identical lists should return 1.0"""
        a = ["a", "b", "c"]
        b = ["a", "b", "c"]
        assert overlap_coefficient(a, b) == 1.0
    
    def test_no_overlap(self):
        """no overlap should return 0.0"""
        a = ["a", "b", "c"]
        b = ["d", "e", "f"]
        assert overlap_coefficient(a, b) == 0.0
    
    def test_subset(self):
        """subset should return 1.0"""
        a = ["a", "b"]
        b = ["a", "b", "c", "d", "e"]
        # intersection: {a, b} = 2
        # min size: 2
        assert overlap_coefficient(a, b) == 1.0
    
    def test_multilingual_not_penalized(self):
        """
        multilingual users should not be penalized
        this is the key difference from jaccard
        """
        # user speaks 5 languages
        multilingual = ["English", "Spanish", "French", "German", "Italian"]
        # other user speaks 2 languages
        bilingual = ["English", "Spanish"]
        
        # overlap coefficient = |{English, Spanish}| / min(5, 2) = 2/2 = 1.0
        assert overlap_coefficient(multilingual, bilingual) == 1.0
        
        # contrast with jaccard which would penalize
        # jaccard = |{English, Spanish}| / |union of 5 + 2 - 2| = 2/5 = 0.4
        assert jaccard(multilingual, bilingual) == 0.4
    
    def test_empty_lists(self):
        """empty lists should return 0.0"""
        assert overlap_coefficient([], []) == 0.0
    
    def test_one_empty(self):
        """one empty list should return 0.0"""
        assert overlap_coefficient(["a", "b"], []) == 0.0
        assert overlap_coefficient([], ["a", "b"]) == 0.0


class TestLanguageScore:
    """tests for language score function"""
    
    def test_no_penalty_for_extra_languages(self):
        """
        extra languages should not reduce score
        this is the key design requirement
        """
        # user speaks many languages
        multilingual = ["English", "Hindi", "Punjabi", "French", "Spanish"]
        # other user speaks fewer
        bilingual = ["English", "Hindi"]
        
        score = language_score(multilingual, bilingual)
        # overlap coefficient = 2/2 = 1.0
        assert score == 1.0
    
    def test_high_signal_boost(self):
        """sharing high-signal language should add boost"""
        # both speak persian (a high-signal language)
        a = ["English", "Persian"]
        b = ["French", "Persian"]
        
        score = language_score(a, b)
        # overlap: {Persian} = 1, min size = 2
        # base = 1/2 = 0.5
        # with boost: 0.5 + 0.25 = 0.75
        assert score == 0.75
    
    def test_high_signal_capped_at_one(self):
        """score with boost should be capped at 1.0"""
        a = ["Persian"]
        b = ["Persian"]
        
        score = language_score(a, b)
        # base = 1.0 + 0.25 = 1.25 -> capped to 1.0
        assert score == 1.0
    
    def test_no_overlap(self):
        """no language overlap should return 0.0"""
        a = ["English", "Spanish"]
        b = ["French", "German"]
        assert language_score(a, b) == 0.0
    
    def test_empty_languages(self):
        """empty languages should return 0.0"""
        assert language_score([], ["English"]) == 0.0
        assert language_score(["English"], []) == 0.0


class TestLocationScore:
    """tests for location score function"""
    
    def test_same_current_city(self):
        """same current city should return 1.0"""
        score = location_score("Toronto", None, "Toronto", None)
        assert score == 1.0
    
    def test_same_destination_city(self):
        """same destination city should return 0.8"""
        score = location_score("Toronto", "Montreal", "Vancouver", "Montreal")
        assert score == 0.8
    
    def test_user_destination_matches_candidate_current(self):
        """user going where candidate is should return 0.8"""
        score = location_score("Toronto", "Vancouver", "Vancouver", None)
        assert score == 0.8
    
    def test_candidate_destination_matches_user_current(self):
        """candidate coming where user is should return 0.8"""
        score = location_score("Toronto", None, "Vancouver", "Toronto")
        assert score == 0.8
    
    def test_no_match(self):
        """no location match should return 0.0"""
        score = location_score("Toronto", "Montreal", "Vancouver", "Calgary")
        assert score == 0.0


class TestMutualFriendsScore:
    """tests for mutual friends score function"""
    
    def test_no_mutual_friends(self):
        """no mutual friends should return 0.0"""
        friends = {
            "user1": {"a", "b"},
            "user2": {"c", "d"},
        }
        assert mutual_friends_score("user1", "user2", friends) == 0.0
    
    def test_some_mutual_friends(self):
        """some mutual friends should return proportional score"""
        friends = {
            "user1": {"a", "b", "c"},
            "user2": {"b", "c", "d"},
        }
        # mutual: {b, c} = 2
        # score: min(2, 5) / 5 = 0.4
        assert mutual_friends_score("user1", "user2", friends) == 0.4
    
    def test_capped_at_five(self):
        """mutual friends score should be capped at 1.0 (5 friends)"""
        friends = {
            "user1": {"a", "b", "c", "d", "e", "f", "g"},
            "user2": {"a", "b", "c", "d", "e", "f", "g"},
        }
        # mutual: 7
        # score: min(7, 5) / 5 = 1.0
        assert mutual_friends_score("user1", "user2", friends) == 1.0


class TestRecencyScore:
    """tests for recency score function"""
    
    def test_recent_activity(self):
        """activity within 1 day should return 1.0"""
        now = datetime.now()
        recent = now - timedelta(hours=12)
        assert recency_score(recent) == 1.0
    
    def test_old_activity(self):
        """activity beyond window should return 0.0"""
        now = datetime.now()
        old = now - timedelta(days=20)
        assert recency_score(old, window_days=14) == 0.0
    
    def test_mid_range_activity(self):
        """activity in middle of window should return proportional score"""
        now = datetime.now()
        mid = now - timedelta(days=7)
        score = recency_score(mid, window_days=14)
        # approximately 0.5 (linear decay)
        assert 0.4 < score < 0.6


class TestCultureScore:
    """tests for culture score function"""
    
    def test_overlap(self):
        """any overlap should return 1.0"""
        a = ["Indian", "South Asian"]
        b = ["Indian", "British"]
        assert culture_score(a, b) == 1.0
    
    def test_no_overlap(self):
        """no overlap should return 0.0"""
        a = ["Indian", "South Asian"]
        b = ["Brazilian", "Latin American"]
        assert culture_score(a, b) == 0.0
    
    def test_empty(self):
        """empty lists should return 0.0"""
        assert culture_score([], ["Indian"]) == 0.0
        assert culture_score(["Indian"], []) == 0.0
