"""
in-memory state store for impressions tracking

designed to be swappable with database storage later
"""

from datetime import datetime
from dataclasses import dataclass, field


@dataclass
class ImpressionRecord:
    """record of when a candidate was shown to a viewer"""
    count: int = 0
    last_shown: datetime | None = None


class ImpressionStore:
    """
    in-memory store for tracking impressions
    
    tracks (viewer_id, candidate_id) pairs with count and last_shown timestamp
    used for anti-repeat logic in reranking
    """
    
    def __init__(self):
        # key: (viewer_id, candidate_id), value: ImpressionRecord
        self._impressions: dict[tuple[str, str], ImpressionRecord] = {}
        # track recent impressions per viewer for the "last 50" rule
        self._recent_per_viewer: dict[str, list[str]] = {}
        self._max_recent = 50
    
    def record_impression(self, viewer_id: str, candidate_id: str) -> None:
        """record that viewer saw candidate"""
        key = (viewer_id, candidate_id)
        
        if key not in self._impressions:
            self._impressions[key] = ImpressionRecord()
        
        record = self._impressions[key]
        record.count += 1
        record.last_shown = datetime.now()
        
        # update recent list
        if viewer_id not in self._recent_per_viewer:
            self._recent_per_viewer[viewer_id] = []
        
        recent = self._recent_per_viewer[viewer_id]
        if candidate_id in recent:
            recent.remove(candidate_id)
        recent.append(candidate_id)
        
        # trim to max recent
        if len(recent) > self._max_recent:
            self._recent_per_viewer[viewer_id] = recent[-self._max_recent:]
    
    def get_impression(self, viewer_id: str, candidate_id: str) -> ImpressionRecord:
        """get impression record for a viewer-candidate pair"""
        key = (viewer_id, candidate_id)
        return self._impressions.get(key, ImpressionRecord())
    
    def is_recently_shown(
        self,
        viewer_id: str,
        candidate_id: str,
        within_last_n: int = 50,
    ) -> bool:
        """check if candidate was shown to viewer within last n impressions"""
        recent = self._recent_per_viewer.get(viewer_id, [])
        
        # check if in the last within_last_n items
        if not recent:
            return False
        
        check_slice = recent[-within_last_n:]
        return candidate_id in check_slice
    
    def was_shown_within_days(
        self,
        viewer_id: str,
        candidate_id: str,
        days: int = 7,
    ) -> bool:
        """check if candidate was shown to viewer within last n days"""
        record = self.get_impression(viewer_id, candidate_id)
        
        if not record.last_shown:
            return False
        
        from datetime import timedelta
        cutoff = datetime.now() - timedelta(days=days)
        return record.last_shown >= cutoff
    
    def clear(self) -> None:
        """clear all impressions - useful for testing"""
        self._impressions.clear()
        self._recent_per_viewer.clear()


# module-level singleton
_people_impression_store: ImpressionStore | None = None
_post_impression_store: ImpressionStore | None = None


def get_people_impression_store() -> ImpressionStore:
    """get the singleton people impression store"""
    global _people_impression_store
    if _people_impression_store is None:
        _people_impression_store = ImpressionStore()
    return _people_impression_store


def get_post_impression_store() -> ImpressionStore:
    """get the singleton post impression store"""
    global _post_impression_store
    if _post_impression_store is None:
        _post_impression_store = ImpressionStore()
    return _post_impression_store


def reset_impression_stores() -> None:
    """reset all impression stores - useful for testing"""
    global _people_impression_store, _post_impression_store
    _people_impression_store = None
    _post_impression_store = None
