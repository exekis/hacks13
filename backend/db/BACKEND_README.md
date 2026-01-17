# Backend Setup

This document describes how to set up the PostgreSQL database for this project.

## Prerequisites

- PostgreSQL must be installed and running.
- Python 3 must be installed.
- `pip` for Python 3 must be installed.

## Setup Steps

1.  **Create the database:**

    ```bash
    createdb hacks13
    ```

2.  **Create the tables:**

    ```bash
    psql -d hacks13 -f db/schema.sql
    ```

3.  **Install Python dependencies:**

    ```bash
    pip3 install -r requirements.txt
    ```

    *(Note: A `requirements.txt` file will be created in a subsequent step)*

4.  **Seed the database:**

    Before running the seed script, you need to set the following environment variables:

    ```bash
    export DB_NAME="hacks13"
    export DB_USER="your_postgres_username"
    export DB_PASSWORD="your_postgres_password"
    export DB_HOST="localhost"
    export DB_PORT="5432"
    ```

    Then run the seed script:

    ```bash
    python3 db/seed.py
    ```

## To Query the DB
- In backend/
`psql -U [username] -d hacks13`

- Should now see `hacks13=#` prompt in terminal

- To list all tables `\dt`

- Can directly query here, ex: `SELECT * FROM posts LIMIT 10;`

- To modify table schema, example:
```sql
ALTER TABLE posts
ALTER COLUMN embedding TYPE FLOAT8[]
```

- To reset table to blank:
```sql
TRUNCATE TABLE posts RESTART IDENTITY;
```