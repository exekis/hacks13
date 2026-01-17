#!/bin/bash

# full stack spinup script

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "travelmate full stack spinup"
echo "========================================"

# export db config for all child processes
export DB_NAME="${DB_NAME:-hacks13}"
export DB_USER="${DB_USER:-$(whoami)}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export DB_PASSWORD="${DB_PASSWORD:-}"

# step 1: setup database using the python script
echo ""
echo "[full-spinup] setting up database..."

# activate venv if available
if [ -d "$PROJECT_ROOT/.venv" ]; then
    source "$PROJECT_ROOT/.venv/bin/activate"
fi

# run the unified setup script
python "$PROJECT_ROOT/backend/db/setup_db.py"

# step 2: start backend in background
echo ""
echo "[full-spinup] launching backend..."
chmod +x "$SCRIPT_DIR/backend.sh"
"$SCRIPT_DIR/backend.sh" &
BACKEND_PID=$!
echo "[full-spinup] backend launched with pid $BACKEND_PID"

# wait for backend to be ready
echo "[full-spinup] waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "[full-spinup] backend is ready!"
        break
    fi
    sleep 1
done

# step 3: start frontend in background
echo ""
echo "[full-spinup] launching frontend..."
chmod +x "$SCRIPT_DIR/frontend.sh"
"$SCRIPT_DIR/frontend.sh" &
FRONTEND_PID=$!
echo "[full-spinup] frontend launched with pid $FRONTEND_PID"

echo ""
echo "========================================"
echo "services are starting."
echo "  backend:  http://localhost:8000"
echo "  frontend: http://localhost:5173"
echo "press ctrl+c to stop all services."
echo "========================================"

# cleanup function
cleanup() {
    echo ""
    echo "[full-spinup] stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    # kill any remaining uvicorn processes
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    echo "[full-spinup] services stopped."
    exit 0
}

# trap sigint (ctrl+c)
trap cleanup SIGINT SIGTERM

# wait for processes
wait
