# TravelMate Recommendations System

## Overview

This document explains how the recommendation system works and how to set up the full stack.

## Quick Start

```bash
# from project root
./scripts/full-spinup.sh
```

This single command will:
1. Set up the PostgreSQL database (create if needed)
2. Apply the appropriate schema (with or without pgvector)
3. Seed mock data (100 users, 300 posts, 50 conversations)
4. Generate recommendations for all users
5. Start the backend API on http://localhost:8000
6. Start the frontend on http://localhost:5173

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   PostgreSQL    │
│   (React)       │     │   (FastAPI)     │     │   (pgvector?)   │
│   :5173/5174    │     │   :8000         │     │   :5432         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## API Endpoints

### Health Check
```
GET /api/health
```

### People Recommendations
```
GET /api/recommendations/people?user_id={userid}&limit={n}
```

Returns array of recommended users with:
- `userid`, `name`, `pronouns`, `currentCity`, `travelingTo`
- `age`, `bio`, `languages[]`, `lookingFor[]`
- `culturalIdentity[]`, `isStudent`, `university`

### Post Recommendations
```
GET /api/recommendations/posts?user_id={userid}&limit={n}
```

Returns array of recommended posts with:
- `postid`, `time_posted`, `post_content`
- `author_id`, `author_name`, `author_location`

## Database Configuration

Environment variables (all have sensible defaults):
- `DB_NAME` - database name (default: `hacks13`)
- `DB_USER` - database user (default: current user)
- `DB_HOST` - database host (default: `localhost`)
- `DB_PORT` - database port (default: `5432`)
- `DB_PASSWORD` - database password (default: empty)

## Vector Database Support

The system supports two modes:

### Without pgvector (default)
- Uses random recommendations
- No ML/embedding dependencies
- Works out of the box

### With pgvector
- Uses embedding-based similarity
- Requires pgvector extension
- Better recommendation quality

To install pgvector:
```bash
./scripts/install-pgvector.sh
```

Then re-run db-setup to use vector-based recommendations:
```bash
./scripts/db-setup.sh
```

## Recommendation Algorithm

### People Recommendations
When pgvector is available:
- Jaccard similarity on interests, languages, cultural identity
- Location scoring (same city, nearby, traveling to)
- Friend-of-friend network effects
- Diversity constraints (avoid recommending too many similar people)

When pgvector is not available:
- Random sampling from non-blocked users
- Scores assigned randomly for sorting

### Post/Event Recommendations
When pgvector is available:
- Cosine similarity between user embedding and post embeddings
- User embedding = average of their own post embeddings
- Distance-based ranking

When pgvector is not available:
- Random sampling from posts by other users
- Distance scores assigned randomly

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/full-spinup.sh` | Start everything (db + backend + frontend) |
| `scripts/db-setup.sh` | Database setup only |
| `scripts/backend.sh` | Backend server only |
| `scripts/frontend.sh` | Frontend dev server only |
| `scripts/install-pgvector.sh` | Install pgvector extension |

## Frontend Integration

The frontend fetches recommendations from the backend API:

```typescript
// fetch people recommendations
const response = await fetch(`${API_BASE_URL}/recommendations/people?user_id=${userId}&limit=10`);
const people = await response.json();

// fetch post recommendations
const response = await fetch(`${API_BASE_URL}/recommendations/posts?user_id=${userId}&limit=20`);
const posts = await response.json();
```

The `WebFeed.tsx` and `Feed.tsx` components:
1. Call APIs on mount with the current user's ID
2. Show loading spinner while fetching
3. Transform backend data to frontend format
4. Fall back to mock data if API unavailable

## Troubleshooting

### Backend won't start
```bash
# check postgres is running
brew services list | grep postgres

# start postgres
brew services start postgresql@18
```

### Database errors
```bash
# recreate database from scratch
dropdb hacks13
./scripts/db-setup.sh
```

### Recommendations empty
```bash
# regenerate recommendations
cd /path/to/project
DB_USER=$(whoami) DB_NAME=hacks13 python backend/db/generate_all_recs.py
```

### pgvector issues
The system works fine without pgvector - it just uses random recommendations instead of embedding-based similarity. Only install pgvector if you need better recommendation quality.
