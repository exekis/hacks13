#!/bin/bash

# full stack spinup script

echo "----------------------------------------"
echo "starting full stack environment"
echo "----------------------------------------"

# start backend in background
echo "[full-spinup] launching backend..."
./scripts/backend.sh &
BACKEND_PID=$!
echo "[full-spinup] backend launched with pid $BACKEND_PID"

# start frontend in background
echo "[full-spinup] launching frontend..."
./scripts/frontend.sh &
FRONTEND_PID=$!
echo "[full-spinup] frontend launched with pid $FRONTEND_PID"

echo "----------------------------------------"
echo "services are starting."
echo "press ctrl+c to stop all services."
echo "----------------------------------------"

# cleanup function
cleanup() {
    echo ""
    echo "[full-spinup] stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "[full-spinup] services stopped."
    exit 0
}

# trap sigint (ctrl+c)
trap cleanup SIGINT

# wait for processes
wait
