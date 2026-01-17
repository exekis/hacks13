#!/bin/bash

# backend startup script for travelmate recommendations api

echo "[backend] starting recommendations api..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/backend" || exit 1

# set pythonpath so app module can be found
export PYTHONPATH="$(pwd)"

# database config (use env vars or defaults)
export DB_NAME="${DB_NAME:-hacks13}"
export DB_USER="${DB_USER:-$(whoami)}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export DB_PASSWORD="${DB_PASSWORD:-}"

# check if virtual environment exists in project root
if [ -d "$PROJECT_ROOT/.venv" ]; then
    source "$PROJECT_ROOT/.venv/bin/activate"
elif [ -d "venv" ]; then
    source "venv/bin/activate"
fi

# install dependencies if needed (including auth deps from latest main)
pip install -q fastapi uvicorn pydantic psycopg2-binary python-jose passlib python-multipart bcrypt cryptography python-dotenv 2>/dev/null || true

# start the server
echo "[backend] starting uvicorn on http://localhost:8000"
echo "[backend] db_name=$DB_NAME db_user=$DB_USER"
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
