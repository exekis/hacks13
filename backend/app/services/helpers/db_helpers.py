import os
import psycopg2

def get_conn() -> psycopg2.extensions.connection:
    """Create and return a new database connection."""
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "hacks13"),
        user=os.getenv("DB_USER", "jennifer"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )
