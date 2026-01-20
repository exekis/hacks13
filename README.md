
<img width="937" height="238" alt="travelmate_banner" src="https://github.com/user-attachments/assets/2b007551-45bd-4b90-bab3-6c02eb55b7f7" />

<p align="center">
  <img src="https://img.shields.io/badge/Python-3475aa?logo=python&logoColor=FFFFFF" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-f55d7a?logo=postgresql&logoColor=FFFFFF" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-428af7.svg?logo=react&logoColor=ffffff" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0a9a8c?logo=fastapi&logoColor=FFFFFF" alt="FastAPI" />
    <img src="https://img.shields.io/github/repo-size/exekis/hacks13?color=f78875" alt="Repo size" />
  <img src="https://img.shields.io/github/last-commit/exekis/hacks13?color=eba265" alt="GitHub last commit" />

</p>



# Travelmate

A social platform for connecting travelers and students.

## Project Structure

```
├── backend/          # FastAPI backend with recommendations API
├── frontend/         # Vite React frontend
└── scripts/          # Development scripts
```

## Development Setup

### Two-Terminal Development

**Terminal 1: Backend (FastAPI)**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2: Frontend (Vite)**
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`
The backend runs at `http://localhost:8000`

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/api/health
```

### People Recommendations
```bash
curl "http://localhost:8000/api/recommendations/people?user_id=user_1&limit=20"
```

### Post Recommendations
```bash
curl "http://localhost:8000/api/recommendations/posts?user_id=user_1&limit=30"
```

### Debug Mode (includes scores)
```bash
curl "http://localhost:8000/api/recommendations/people?user_id=user_1&debug=true"
```

## Demo Users

Available user IDs for testing:
- `user_1` through `user_12`

Example:
```bash
curl "http://localhost:8000/api/recommendations/people?user_id=user_3&limit=10"
```

## Running Tests

```bash
cd backend
pytest tests/ -v
```
