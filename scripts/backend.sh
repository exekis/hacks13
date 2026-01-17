#!/bin/bash

# backend startup script for travelmate recommendations api

echo "[backend] starting recommendations api..."

cd "$(dirname "$0")/../backend" || exit 1

# set pythonpath so app module can be found
export PYTHONPATH="$(pwd)"

# check if virtual environment exists in project root
if [ -d "../.venv" ]; then
    source "../.venv/bin/activate"
elif [ -d "venv" ]; then
    source "venv/bin/activate"
fi

# install dependencies if needed
pip install -q fastapi uvicorn pydantic 2>/dev/null || true

# start the server
echo "[backend] starting uvicorn on http://localhost:8000"
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
