"""
api integration tests for recommendation endpoints

these tests require the server to be running
run with: pytest tests/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient

import sys
sys.path.insert(0, '/Users/exekis/code/hack13/backend')

from app.recommendations_main import app
from app.data.demo import reset_demo_state
from app.state import reset_impression_stores


@pytest.fixture(autouse=True)
def reset_state():
    """reset state before each test"""
    reset_demo_state()
    reset_impression_stores()
    yield
    reset_demo_state()
    reset_impression_stores()


@pytest.fixture
def client():
    """create test client"""
    return TestClient(app)


class TestHealthEndpoint:
    """tests for /api/health endpoint"""
    
    def test_health_returns_ok(self, client):
        """health endpoint should return ok: true"""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"ok": True}


class TestPeopleEndpoint:
    """tests for /api/recommendations/people endpoint"""
    
    def test_returns_people_for_valid_user(self, client):
        """should return list of people for valid user"""
        response = client.get("/api/recommendations/people?user_id=user_1")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_returns_404_for_invalid_user(self, client):
        """should return 404 for non-existent user"""
        response = client.get("/api/recommendations/people?user_id=invalid_user")
        assert response.status_code == 404
    
    def test_respects_limit_parameter(self, client):
        """should respect the limit parameter"""
        response = client.get("/api/recommendations/people?user_id=user_1&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3
    
    def test_includes_debug_scores_when_requested(self, client):
        """should include debug scores when debug=true"""
        response = client.get("/api/recommendations/people?user_id=user_1&debug=true")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert data[0].get("debug_score") is not None
    
    def test_excludes_debug_scores_by_default(self, client):
        """should not include debug scores by default"""
        response = client.get("/api/recommendations/people?user_id=user_1")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert data[0].get("debug_score") is None
    
    def test_response_shape(self, client):
        """should return correct response shape"""
        response = client.get("/api/recommendations/people?user_id=user_1&limit=1")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            person = data[0]
            assert "id" in person
            assert "display_name" in person
            assert "bio" in person
            assert "verified_student" in person
            assert "age_verified" in person
            assert "tags" in person
            assert "mutual_friends_count" in person
            assert "location_hidden" in person


class TestPostsEndpoint:
    """tests for /api/recommendations/posts endpoint"""
    
    def test_returns_posts_for_valid_user(self, client):
        """should return list of posts for valid user"""
        response = client.get("/api/recommendations/posts?user_id=user_1")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_returns_404_for_invalid_user(self, client):
        """should return 404 for non-existent user"""
        response = client.get("/api/recommendations/posts?user_id=invalid_user")
        assert response.status_code == 404
    
    def test_response_shape(self, client):
        """should return correct response shape"""
        response = client.get("/api/recommendations/posts?user_id=user_1&limit=1")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            post = data[0]
            assert "id" in post
            assert "author_id" in post
            assert "author_name" in post
            assert "text" in post
            assert "coarse_location" in post


class TestDeterminism:
    """tests for deterministic behavior"""
    
    def test_same_input_same_output(self, client):
        """same input should produce same output"""
        # reset to ensure clean state
        reset_demo_state()
        reset_impression_stores()
        
        response1 = client.get("/api/recommendations/people?user_id=user_1&limit=10")
        
        # reset again
        reset_demo_state()
        reset_impression_stores()
        
        response2 = client.get("/api/recommendations/people?user_id=user_1&limit=10")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        # should be exactly the same
        assert len(data1) == len(data2)
        for i in range(len(data1)):
            assert data1[i]["id"] == data2[i]["id"]
