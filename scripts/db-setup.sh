#!/bin/bash

# database setup script for travelmate
# handles postgres setup, schema creation, seeding, and recommendation generation

set -e

echo "========================================"
echo "travelmate database setup"
echo "========================================"

# configuration
DB_NAME="${DB_NAME:-hacks13}"
DB_USER="${DB_USER:-$(whoami)}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-}"

# detect postgres binaries
if command -v psql &> /dev/null; then
    PSQL="psql"
    CREATEDB="createdb"
elif [ -f "/opt/homebrew/opt/postgresql@18/bin/psql" ]; then
    PSQL="/opt/homebrew/opt/postgresql@18/bin/psql"
    CREATEDB="/opt/homebrew/opt/postgresql@18/bin/createdb"
elif [ -f "/opt/homebrew/opt/postgresql@17/bin/psql" ]; then
    PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"
    CREATEDB="/opt/homebrew/opt/postgresql@17/bin/createdb"
elif [ -f "/opt/homebrew/opt/postgresql@16/bin/psql" ]; then
    PSQL="/opt/homebrew/opt/postgresql@16/bin/psql"
    CREATEDB="/opt/homebrew/opt/postgresql@16/bin/createdb"
elif [ -f "/usr/local/bin/psql" ]; then
    PSQL="/usr/local/bin/psql"
    CREATEDB="/usr/local/bin/createdb"
else
    echo "[error] postgresql not found! install postgresql first."
    exit 1
fi

echo "[db-setup] using postgres: $PSQL"

# check if postgres is running
check_postgres() {
    echo "[db-setup] checking postgres connection..."
    if ! $PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "SELECT 1;" postgres > /dev/null 2>&1; then
        echo "[db-setup] postgres not running, attempting to start..."
        
        # try homebrew services
        if command -v brew &> /dev/null; then
            # find installed postgres version
            for ver in 18 17 16 15 14; do
                if brew list postgresql@$ver &> /dev/null 2>&1; then
                    echo "[db-setup] starting postgresql@$ver via homebrew..."
                    brew services start postgresql@$ver
                    sleep 3
                    break
                fi
            done
        fi
        
        # verify connection
        if ! $PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "SELECT 1;" postgres > /dev/null 2>&1; then
            echo "[error] could not connect to postgres. please start it manually."
            exit 1
        fi
    fi
    echo "[db-setup] postgres is running"
}

# create database if not exists
create_database() {
    echo "[db-setup] checking database '$DB_NAME'..."
    if $PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "[db-setup] database '$DB_NAME' already exists"
    else
        echo "[db-setup] creating database '$DB_NAME'..."
        $CREATEDB -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        echo "[db-setup] database created"
    fi
}

# check and setup pgvector extension
setup_pgvector() {
    echo "[db-setup] checking pgvector extension..."
    
    # check if vector extension is available
    VECTOR_AVAILABLE=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_available_extensions WHERE name = 'vector';" 2>/dev/null | tr -d ' ')
    
    if [ "$VECTOR_AVAILABLE" = "1" ]; then
        echo "[db-setup] pgvector is available, enabling..."
        $PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true
        echo "[db-setup] pgvector enabled"
        return 0
    else
        echo "[db-setup] pgvector not installed - using fallback schema without vectors"
        echo "[db-setup] to install pgvector: https://github.com/pgvector/pgvector"
        return 1
    fi
}

# create schema
create_schema() {
    local use_vector=$1
    
    echo "[db-setup] creating schema (vector=$use_vector)..."
    
    if [ "$use_vector" = "true" ]; then
        SCHEMA_FILE="$(dirname "$0")/../backend/db/schema.sql"
    else
        SCHEMA_FILE="$(dirname "$0")/../backend/db/schema_novector.sql"
    fi
    
    if [ -f "$SCHEMA_FILE" ]; then
        # check if tables already exist
        TABLE_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'posts', 'conversations', 'messages');" | tr -d ' ')
        
        if [ "$TABLE_COUNT" = "4" ]; then
            echo "[db-setup] tables already exist, checking if they have data..."
            USER_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
            if [ "$USER_COUNT" -gt "0" ]; then
                echo "[db-setup] database already has $USER_COUNT users, skipping schema creation"
                return 0
            fi
        fi
        
        # drop and recreate tables
        echo "[db-setup] creating fresh tables..."
        $PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
            DROP TABLE IF EXISTS Messages CASCADE;
            DROP TABLE IF EXISTS Posts CASCADE;
            DROP TABLE IF EXISTS Conversations CASCADE;
            DROP TABLE IF EXISTS Users CASCADE;
        "
        $PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"
        echo "[db-setup] schema created"
    else
        echo "[error] schema file not found: $SCHEMA_FILE"
        exit 1
    fi
}

# seed database
seed_database() {
    echo "[db-setup] seeding database..."
    
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    # check if already seeded
    USER_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
    if [ "$USER_COUNT" -gt "0" ]; then
        echo "[db-setup] database already has $USER_COUNT users"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # activate virtual environment if available
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi
    
    export DB_NAME DB_USER DB_HOST DB_PORT DB_PASSWORD
    export USERS_FILE="backend/db/mock_data/fake_users.json"
    export POSTS_FILE="backend/db/mock_data/posts.json"
    export CONVERSATIONS_FILE="backend/db/mock_data/conversations.json"
    export MESSAGES_FILE="backend/db/mock_data/messages.json"
    
    python backend/db/seed.py 2>&1 | grep -E "(Loaded|Error)" || true
    
    echo "[db-setup] seeding complete"
}

# generate recommendations
generate_recommendations() {
    local use_vector=$1
    
    echo "[db-setup] generating recommendations..."
    
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    cd "$PROJECT_ROOT"
    
    # activate virtual environment if available
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi
    
    export DB_NAME DB_USER DB_HOST DB_PORT DB_PASSWORD
    
    # check if recommendations already exist
    REC_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users WHERE people_recs IS NOT NULL;" | tr -d ' ')
    if [ "$REC_COUNT" -gt "0" ]; then
        echo "[db-setup] $REC_COUNT users already have recommendations"
        return 0
    fi
    
    # use the unified recommendation generator
    # it automatically detects vector support and falls back appropriately
    python backend/db/generate_all_recs.py 2>&1 || {
        echo "[db-setup] unified recs failed, trying simple recs..."
        python backend/db/generate_recs.py 2>&1 || true
    }
    
    echo "[db-setup] recommendations generated"
}

# verify setup
verify_setup() {
    echo "[db-setup] verifying setup..."
    
    USER_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
    POST_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM posts;" | tr -d ' ')
    CONV_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM conversations;" | tr -d ' ')
    MSG_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM messages;" | tr -d ' ')
    REC_COUNT=$($PSQL -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users WHERE people_recs IS NOT NULL;" | tr -d ' ')
    
    echo "========================================"
    echo "database setup complete!"
    echo "========================================"
    echo "  users:         $USER_COUNT"
    echo "  posts:         $POST_COUNT"
    echo "  conversations: $CONV_COUNT"
    echo "  messages:      $MSG_COUNT"
    echo "  users w/recs:  $REC_COUNT"
    echo "========================================"
}

# main execution
main() {
    check_postgres
    create_database
    
    # try to setup pgvector
    if setup_pgvector; then
        USE_VECTOR="true"
    else
        USE_VECTOR="false"
    fi
    
    create_schema "$USE_VECTOR"
    seed_database
    generate_recommendations "$USE_VECTOR"
    verify_setup
}

main "$@"
