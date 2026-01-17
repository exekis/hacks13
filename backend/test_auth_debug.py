"""Debug test for authentication password issue"""
import sys
sys.path.insert(0, '/Users/gabriel/Documents/GitHub/UofTHacks/hacks13/backend')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test signup with a simple password
test_email = "test@example.com"
test_password = "password123"

print(f"Testing with password: '{test_password}'")
print(f"Password length: {len(test_password)} bytes")
print(f"Password bytes: {test_password.encode('utf-8')}")

# Test signup
response = client.post(
    "/signup",
    json={"email": test_email, "password": test_password}
)
print(f"\nSignup response status: {response.status_code}")
print(f"Signup response: {response.json() if response.status_code == 200 else response.text}")

# Test login with URLEncoded form (like frontend does)
from urllib.parse import urlencode
login_data = urlencode({'username': test_email, 'password': test_password})
print(f"\nURL encoded login data: {login_data}")
print(f"URL encoded login data length: {len(login_data)}")

response = client.post(
    "/login",
    data={'username': test_email, 'password': test_password},
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)
print(f"\nLogin response status: {response.status_code}")
print(f"Login response: {response.json() if response.status_code == 200 else response.text}")
