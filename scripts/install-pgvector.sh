#!/bin/bash

# install pgvector extension for postgresql
# run this script if you want to use vector similarity for recommendations

set -e

echo "========================================"
echo "pgvector installation"
echo "========================================"

# detect os
OS="$(uname -s)"

case "$OS" in
    Darwin)
        echo "[pgvector] detected macos"
        
        # check if postgresql is installed via homebrew
        if ! command -v brew &> /dev/null; then
            echo "[error] homebrew not found. install from https://brew.sh"
            exit 1
        fi
        
        # find postgres version
        PG_VERSION=""
        for ver in 18 17 16 15 14; do
            if brew list postgresql@$ver &> /dev/null 2>&1; then
                PG_VERSION=$ver
                break
            fi
        done
        
        if [ -z "$PG_VERSION" ]; then
            echo "[error] postgresql not found via homebrew"
            exit 1
        fi
        
        echo "[pgvector] found postgresql@$PG_VERSION"
        
        # check if pgvector already installed
        PG_CONFIG="/opt/homebrew/opt/postgresql@$PG_VERSION/bin/pg_config"
        if [ ! -f "$PG_CONFIG" ]; then
            PG_CONFIG="/usr/local/opt/postgresql@$PG_VERSION/bin/pg_config"
        fi
        
        SHAREDIR=$($PG_CONFIG --sharedir)
        if [ -f "$SHAREDIR/extension/vector.control" ]; then
            echo "[pgvector] already installed!"
            exit 0
        fi
        
        # install build dependencies
        echo "[pgvector] installing build dependencies..."
        
        # clone and build pgvector
        echo "[pgvector] building pgvector..."
        cd /tmp
        rm -rf pgvector
        git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
        cd pgvector
        
        export PATH="/opt/homebrew/opt/postgresql@$PG_VERSION/bin:$PATH"
        make
        make install
        
        echo "[pgvector] installation complete!"
        echo "[pgvector] restart postgresql and run: CREATE EXTENSION vector;"
        ;;
        
    Linux)
        echo "[pgvector] detected linux"
        
        # check for apt or yum
        if command -v apt &> /dev/null; then
            echo "[pgvector] using apt package manager"
            
            # try to install from package if available
            if apt-cache show postgresql-16-pgvector &> /dev/null 2>&1; then
                sudo apt install -y postgresql-16-pgvector
            elif apt-cache show postgresql-15-pgvector &> /dev/null 2>&1; then
                sudo apt install -y postgresql-15-pgvector
            else
                echo "[pgvector] package not available, building from source..."
                sudo apt install -y build-essential git postgresql-server-dev-all
                cd /tmp
                rm -rf pgvector
                git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
                cd pgvector
                make
                sudo make install
            fi
        elif command -v yum &> /dev/null; then
            echo "[pgvector] using yum package manager"
            sudo yum install -y git gcc make postgresql-devel
            cd /tmp
            rm -rf pgvector
            git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
            cd pgvector
            make
            sudo make install
        else
            echo "[error] unsupported linux distribution"
            exit 1
        fi
        
        echo "[pgvector] installation complete!"
        echo "[pgvector] restart postgresql and run: CREATE EXTENSION vector;"
        ;;
        
    *)
        echo "[error] unsupported os: $OS"
        echo "see https://github.com/pgvector/pgvector for manual installation"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "next steps:"
echo "1. restart postgresql"
echo "2. connect to your database"
echo "3. run: CREATE EXTENSION vector;"
echo "4. re-run db-setup.sh to use vector features"
echo "========================================"
