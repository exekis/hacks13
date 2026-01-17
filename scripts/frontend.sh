#!/bin/bash

# frontend startup script

echo "[frontend] starting frontend setup..."

cd "$(dirname "$0")/../frontend" || exit 1

echo "[frontend] installing dependencies..."
npm install

echo "[frontend] starting development server..."
npm run dev
