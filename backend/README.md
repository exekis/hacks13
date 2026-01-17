# Travelmate Backend - Recommendations API

A deterministic, fair recommendation algorithm for the Travelmate app.

## Quick Start (Database + Backend)

```bash
# from project root
cd /path/to/hack13

# create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# install dependencies
pip install -r backend/requirements.txt

# setup database (creates db, tables, seeds data, generates recommendations)
DB_USER=$(whoami) python backend/db/setup_db.py

# start backend
./scripts/backend.sh
```

The setup script handles everything:
- Creates the `hacks13` database if needed
- Creates all tables with correct schema
- Seeds 100 users, 300 posts, 50 conversations, 173 messages
- Generates recommendations for all users

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
        ├── recommendations_helpers # helper functions for recommendations
            └── cg_events.py      # SQL logic for generating + storing post recommendations
│   │   ├── recommender.py        # Main recommendation logic
│   │   └── similarity.py         # Scoring helper functions
│   ├── state.py                  # Impression tracking store
│   └── main.py   # FastAPI application
├── db/
│   ├── setup_db.py               # Complete database setup script
│   ├── mock_data/                # JSON seed data files
│   └── schema.sql                # SQL schema (reference only)
├── tests/
│   ├── test_similarity.py        # Unit tests for scoring functions
│   └── test_recommender.py       # Unit tests for candidate generation
└── requirements.txt
```

## Database Setup

The easiest way to set up the database:

```bash
DB_USER=$(whoami) python backend/db/setup_db.py
```

Environment variables:
- `DB_NAME` - database name (default: `hacks13`)
- `DB_USER` - database user (default: current user)
- `DB_HOST` - database host (default: `localhost`)
- `DB_PORT` - database port (default: `5432`)
- `DB_PASSWORD` - database password (default: empty)

## Manual Setup (Alternative)

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

### 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
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
