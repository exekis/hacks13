from dotenv import load_dotenv
import psycopg2
import os

load_dotenv()

# Database connection parameters
DB_NAME = os.getenv("DB_NAME", "hacks13")
DB_USER = os.getenv("DB_USER", "jennifer")
DB_PASSWORD = os.getenv("DB_PASSWORD", "") # can leave password blank
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

# Connect to the database
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
except psycopg2.Error as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Execute a query
try:
    cur.execute("SELECT * FROM Users LIMIT 5")
    rows = cur.fetchall()
    for row in rows:
        print(row)
except psycopg2.Error as e:
    print(f"Error executing query: {e}")
    conn.rollback()

# Close the connection
cur.close()
conn.close()
