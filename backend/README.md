# Travelmate Backend - Recommendations API

A deterministic, fair recommendation algorithm for the Travelmate app.

## Overview

This backend provides two main endpoints for recommendations:
- **People recommendations**: Find potential friends based on location, goals, languages, and cultural backgrounds
- **Post recommendations**: Surface relevant travel posts from friends and friends-of-friends

## Architecture

```
backend/
├── app/
│   ├── api/
│   │   └── recommendations.py    # API endpoints
│   ├── data/
│   │   └── demo.py               # In-memory demo data
│   ├── models/
│   │   └── recommendation.py     # Pydantic models
│   ├── services/
│   │   ├── recommender.py        # Main recommendation logic
│   │   └── similarity.py         # Scoring helper functions
│   ├── state.py                  # Impression tracking store
│   └── recommendations_main.py   # FastAPI application
├── tests/
│   ├── test_similarity.py        # Unit tests for scoring functions
│   └── test_recommender.py       # Unit tests for candidate generation
└── requirements.txt
```

## Quick Start

### 1. Create virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

Set up pgvector: https://github.com/pgvector/pgvector

```bash
# Mac
cd /tmp
git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
make install # may need sudo

# Windows
set "PGROOT=C:\Program Files\PostgreSQL\18"
cd %TEMP%
git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector
nmake /F Makefile.win
nmake /F Makefile.win install
```

### 3. Run the server

```bash
uvicorn app.recommendations_main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check

```bash
curl http://localhost:8000/api/health
# Response: {"ok": true}
```

### Get People Recommendations

```bash
curl "http://localhost:8000/api/recommendations/people?user_id=user_1&limit=20"
```

Query Parameters:
- `user_id` (required): The user to get recommendations for
- `limit` (optional, default 20): Maximum number of results
- `debug` (optional, default false): Include debug scores in response

### Get Post Recommendations

```bash
curl "http://localhost:8000/api/recommendations/posts?user_id=user_1&limit=30"
```

Query Parameters:
- `user_id` (required): The user to get recommendations for
- `limit` (optional, default 30): Maximum number of results
- `debug` (optional, default false): Include debug scores in response

## Demo Users

The system includes 12 demo users with diverse backgrounds:

| User ID | Name | City | Cultural Background |
|---------|------|------|---------------------|
| user_1 | Priya Sharma | Toronto | Indian, South Asian |
| user_2 | Marcus Chen | Vancouver | Taiwanese, East Asian |
| user_3 | Fatima Al-Rashid | Montreal | Arab, Middle Eastern |
| user_4 | Diego Santos | Toronto | Brazilian, Latin American |
| user_5 | Amara Okonkwo | Toronto | Nigerian, West African |
| user_6 | Yuki Tanaka | Vancouver | Japanese, East Asian |
| user_7 | Alex Kim | Toronto | Korean, East Asian |
| user_8 | Sofia Martinez | Montreal | Mexican, Latin American |
| user_9 | Hassan Javed | Toronto | Pakistani, South Asian |
| user_10 | Linh Nguyen | Toronto | Vietnamese, Southeast Asian |
| user_11 | Ibrahim Diallo | Montreal | Senegalese, West African |
| user_12 | Zara Patel | Vancouver | Indian, British, South Asian |

## Algorithm Details

### People Scoring Formula

```
score = 
  0.30 * location_score +
  0.25 * jaccard(goals) +
  0.20 * culture_score +
  0.15 * language_score +
  0.05 * mutual_friends_score +
  0.05 * recency_score +
  0.05 if verified_student
```

### Key Design Decisions

1. **Language Score**: Uses overlap coefficient instead of Jaccard to avoid penalizing multilingual users
2. **High-Signal Languages**: Configurable set (e.g., Persian) that gets an extra boost when shared
3. **Diversity Constraints**: Caps results to prevent monoculture clumping
4. **Anti-Repeat**: Penalizes recently shown candidates to ensure fresh recommendations
5. **New User Boost**: Gives new users extra visibility in the first 14 days

## Running Tests

```bash
cd backend
pytest tests/ -v
```

## Future Improvements

- Swap demo data with PostgreSQL queries
- Add rate limiting
- Implement caching for expensive computations
- Add A/B testing framework
