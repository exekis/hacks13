#!/usr/bin/env python3
"""
complete database setup and seeding script

this script handles everything needed to get a fresh database up and running:
1. creates the database if it doesn't exist
2. creates all tables with the correct schema
3. seeds users, posts, conversations, messages from mock data
4. generates recommendations for all users

usage:
    DB_USER=$(whoami) python backend/db/setup_db.py

environment variables:
    DB_NAME     - database name (default: hacks13)
    DB_USER     - database user (default: current user)
    DB_PASSWORD - database password (default: empty)
    DB_HOST     - database host (default: localhost)
    DB_PORT     - database port (default: 5432)
"""

import json
import os
import random
import subprocess
import sys

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:
    print("Installing psycopg2-binary...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
    import psycopg2
    from psycopg2.extras import Json

import hashlib

def hash_password(password: str) -> str:
    """simple sha256 hash for demo purposes"""
    return hashlib.sha256(password.encode()).hexdigest()


# configuration
DB_NAME = os.getenv("DB_NAME", "hacks13")
DB_USER = os.getenv("DB_USER", os.getenv("USER", "postgres"))
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

# find project root (this script is in backend/db/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
MOCK_DATA_DIR = os.path.join(SCRIPT_DIR, "mock_data")

USERS_FILE = os.path.join(MOCK_DATA_DIR, "profiles.json")
POSTS_FILE = os.path.join(MOCK_DATA_DIR, "posts.json")
CONVERSATIONS_FILE = os.path.join(MOCK_DATA_DIR, "conversations.json")
MESSAGES_FILE = os.path.join(MOCK_DATA_DIR, "messages.json")


# schema that matches the seed data and api expectations
SCHEMA_SQL = """
-- drop existing tables to start fresh
DROP TABLE IF EXISTS Messages CASCADE;
DROP TABLE IF EXISTS Posts CASCADE;
DROP TABLE IF EXISTS Conversations CASCADE;
DROP TABLE IF EXISTS Auth CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- create users table
CREATE TABLE Users (
    userID INT PRIMARY KEY,
    Name VARCHAR(255),
    Age INT,
    Email VARCHAR(255) UNIQUE,
    pronouns VARCHAR(255),
    isStudent BOOLEAN,
    university VARCHAR(255),
    currentCity VARCHAR(255),
    travelingTo VARCHAR(255),
    languages TEXT[],
    hometown VARCHAR(255),
    agePreference INT,
    verifiedStudentsOnly BOOLEAN,
    culturalIdentity TEXT[],
    ethnicity VARCHAR(255),
    religion VARCHAR(255),
    culturalSimilarityImportance INT,
    culturalComfortLevel VARCHAR(255),
    languageMatchImportant BOOLEAN,
    purposeOfStay VARCHAR(255),
    lookingFor TEXT[],
    socialVibe TEXT[],
    whoCanSeePosts VARCHAR(255),
    hideLocationUntilFriends BOOLEAN,
    meetupPreference VARCHAR(255),
    boundaries TEXT,
    bio TEXT,
    AboutMe TEXT,
    Friends INT[],
    BlockedUsers INT[],
    recs JSONB[],
    event_recs_emb JSONB[],
    event_recs_dis JSONB[],
    people_recs JSONB
);

-- create posts table (matches seed.py expectations)
CREATE TABLE Posts (
    PostID INT PRIMARY KEY,
    user_id INT REFERENCES Users(userID),
    location_str VARCHAR(255),
    location_coords POINT,
    time_posted TIMESTAMPTZ DEFAULT NOW(),
    post_content TEXT
);

-- create conversations table
CREATE TABLE Conversations (
    conversationID SERIAL PRIMARY KEY,
    user_a INT NOT NULL REFERENCES Users(userID),
    user_b INT NOT NULL REFERENCES Users(userID),
    last_messaged TIMESTAMPTZ DEFAULT NOW(),
    user_low INT GENERATED ALWAYS AS (LEAST(user_a, user_b)) STORED,
    user_high INT GENERATED ALWAYS AS (GREATEST(user_a, user_b)) STORED
);

-- create messages table
CREATE TABLE Messages (
    messageID SERIAL PRIMARY KEY,
    conversationID INT NOT NULL REFERENCES Conversations(conversationID),
    senderID INT NOT NULL REFERENCES Users(userID),
    message_content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- create auth table for password storage
CREATE TABLE Auth (
    userID INT PRIMARY KEY REFERENCES Users(userID),
    password_hash VARCHAR(255) NOT NULL
);

-- create indexes for common queries
CREATE INDEX idx_posts_user_id ON Posts(user_id);
CREATE INDEX idx_messages_conversation ON Messages(conversationID);
CREATE INDEX idx_conversations_users ON Conversations(user_a, user_b);
"""


def get_admin_conn():
    """connect to postgres database to create our db"""
    return psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


def get_conn():
    """connect to our application database"""
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


def create_database():
    """create the database if it doesn't exist"""
    print(f"[setup] checking if database '{DB_NAME}' exists...")
    
    conn = get_admin_conn()
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    exists = cur.fetchone() is not None
    
    if not exists:
        print(f"[setup] creating database '{DB_NAME}'...")
        cur.execute(f'CREATE DATABASE "{DB_NAME}"')
        print(f"[setup] database created")
    else:
        print(f"[setup] database already exists")
    
    cur.close()
    conn.close()


def create_schema():
    """create all tables"""
    print("[setup] creating schema...")
    
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute(SCHEMA_SQL)
    conn.commit()
    
    cur.close()
    conn.close()
    print("[setup] schema created")


def load_users():
    """load users from mock data"""
    print("[setup] loading users...")
    
    if not os.path.exists(USERS_FILE):
        print(f"[error] users file not found: {USERS_FILE}")
        return 0
    
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        users_data = json.load(f)
    
    conn = get_conn()
    cur = conn.cursor()
    
    count = 0
    for user in users_data:
        try:
            cur.execute(
                """
                INSERT INTO Users (
                    userID, Name, Age, Email, pronouns, isStudent, university, currentCity,
                    languages, hometown, agePreference, verifiedStudentsOnly,
                    culturalIdentity, ethnicity, religion, culturalSimilarityImportance,
                    culturalComfortLevel, languageMatchImportant, lookingFor,
                    socialVibe, whoCanSeePosts, hideLocationUntilFriends, meetupPreference,
                    boundaries, bio, Friends
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (userID) DO NOTHING
                """,
                (
                    user["userid"],
                    user["name"],
                    user["age"],
                    user["email"],
                    user["pronouns"],
                    user["isstudent"] == 't',
                    user["university"],
                    user["currentcity"],
                    user["languages"],
                    user["hometown"],
                    user["agepreference"],
                    user["verifiedstudentsonly"] == 't',
                    [user["culturalidentity"]],
                    user["ethnicity"],
                    user["religion"],
                    user["culturalsimilarityimportance"],
                    user["culturalcomfortlevel"],
                    user["languagematchimportant"] == 't',
                    user["lookingfor"],
                    [user["socialvibe"]],
                    user["whocanseeposts"],
                    user["hidelocationuntilfriends"] == 't',
                    user["meetuppreference"],
                    user["boundaries"],
                    user["bio"],
                    user["friends"],
                ),
            )
            count += 1
        except psycopg2.Error as e:
            print(f"  [warn] error inserting user {user.get('userid')}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"[setup] loaded {count} users")
    return count


def create_auth_credentials():
    """create fake auth credentials for all users
    
    default password for all users: password123
    this is for development/testing only
    """
    print("[setup] creating auth credentials...")
    
    # default password for all fake users
    default_password = "password123"
    password_hash = hash_password(default_password)
    
    conn = get_conn()
    cur = conn.cursor()
    
    # get all user ids
    cur.execute("SELECT userid, email FROM users")
    users = cur.fetchall()
    
    count = 0
    for user_id, email in users:
        try:
            cur.execute(
                """
                INSERT INTO Auth (userID, password_hash)
                VALUES (%s, %s)
                ON CONFLICT (userID) DO UPDATE SET password_hash = EXCLUDED.password_hash
                """,
                (user_id, password_hash)
            )
            count += 1
        except psycopg2.Error as e:
            print(f"  [warn] error creating auth for user {user_id}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"[setup] created auth for {count} users (password: {default_password})")
    return count


def load_posts():
    """load posts from mock data"""
    print("[setup] loading posts...")
    
    if not os.path.exists(POSTS_FILE):
        print(f"[error] posts file not found: {POSTS_FILE}")
        return 0
    
    with open(POSTS_FILE, "r", encoding="utf-8") as f:
        posts_data = json.load(f)
    
    conn = get_conn()
    cur = conn.cursor()
    
    count = 0
    for post_id, post in posts_data.items():
        try:
            cur.execute(
                """
                INSERT INTO Posts (PostID, user_id, time_posted, post_content)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (PostID) DO NOTHING
                """,
                (
                    int(post_id),
                    post["user_id"],
                    post.get("time_posted"),
                    post.get("post_content"),
                ),
            )
            count += 1
        except psycopg2.Error as e:
            print(f"  [warn] error inserting post {post_id}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"[setup] loaded {count} posts")
    return count


def load_conversations():
    """load conversations from mock data"""
    print("[setup] loading conversations...")
    
    if not os.path.exists(CONVERSATIONS_FILE):
        print(f"[error] conversations file not found: {CONVERSATIONS_FILE}")
        return 0
    
    with open(CONVERSATIONS_FILE, "r", encoding="utf-8") as f:
        convos_data = json.load(f)
    
    conn = get_conn()
    cur = conn.cursor()
    
    count = 0
    for convo_id, convo in convos_data.items():
        try:
            cur.execute(
                """
                INSERT INTO Conversations (conversationID, user_a, user_b, last_messaged)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (conversationID) DO NOTHING
                """,
                (
                    int(convo.get("conversationID", convo_id)),
                    convo["user_a"],
                    convo["user_b"],
                    convo.get("last_messaged"),
                ),
            )
            count += 1
        except psycopg2.Error as e:
            print(f"  [warn] error inserting conversation {convo_id}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    
    # fix serial sequence
    cur.execute("""
        SELECT setval(
            pg_get_serial_sequence('conversations', 'conversationid'),
            COALESCE((SELECT MAX(conversationid) FROM conversations), 1)
        )
    """)
    conn.commit()
    
    cur.close()
    conn.close()
    
    print(f"[setup] loaded {count} conversations")
    return count


def load_messages():
    """load messages from mock data"""
    print("[setup] loading messages...")
    
    if not os.path.exists(MESSAGES_FILE):
        print(f"[error] messages file not found: {MESSAGES_FILE}")
        return 0
    
    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
        messages_data = json.load(f)
    
    conn = get_conn()
    cur = conn.cursor()
    
    count = 0
    for msg_id, msg in messages_data.items():
        try:
            cur.execute(
                """
                INSERT INTO Messages (messageID, conversationID, senderID, message_content, timestamp)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (messageID) DO NOTHING
                """,
                (
                    int(msg_id),
                    msg["conversationID"],
                    msg["senderID"],
                    msg["message_content"],
                    msg.get("timestamp"),
                ),
            )
            count += 1
        except psycopg2.Error as e:
            print(f"  [warn] error inserting message {msg_id}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    
    # fix serial sequence
    cur.execute("""
        SELECT setval(
            pg_get_serial_sequence('messages', 'messageid'),
            COALESCE((SELECT MAX(messageid) FROM messages), 1)
        )
    """)
    conn.commit()
    
    # update conversation last_messaged timestamps
    cur.execute("""
        UPDATE Conversations c
        SET last_messaged = m.max_ts
        FROM (
            SELECT conversationID, MAX(timestamp) AS max_ts
            FROM Messages
            GROUP BY conversationID
        ) m
        WHERE c.conversationID = m.conversationID
    """)
    conn.commit()
    
    cur.close()
    conn.close()
    
    print(f"[setup] loaded {count} messages")
    return count


def generate_recommendations():
    """generate random recommendations for all users"""
    print("[setup] generating recommendations...")
    
    conn = get_conn()
    cur = conn.cursor()
    
    # get all user ids
    cur.execute("SELECT userid FROM users")
    user_ids = [row[0] for row in cur.fetchall()]
    
    # get all posts
    cur.execute("SELECT postid, user_id FROM posts")
    posts = cur.fetchall()
    
    for uid in user_ids:
        # people recommendations (exclude self)
        other_users = [u for u in user_ids if u != uid]
        random.shuffle(other_users)
        people_recs = [{"userid": u, "score": round(random.random(), 3)} for u in other_users[:30]]
        
        # post recommendations (exclude own posts)
        other_posts = [p[0] for p in posts if p[1] != uid]
        random.shuffle(other_posts)
        event_recs = [{"postid": p, "distance": round(random.random(), 3)} for p in other_posts[:50]]
        
        # update user
        cur.execute(
            "UPDATE users SET people_recs = %s::jsonb WHERE userid = %s",
            (Json(people_recs), uid)
        )
        
        event_recs_json = [Json(e) for e in event_recs]
        cur.execute(
            "UPDATE users SET event_recs_emb = %s::jsonb[] WHERE userid = %s",
            (event_recs_json, uid)
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"[setup] generated recommendations for {len(user_ids)} users")


def verify_setup():
    """verify the database is properly set up"""
    print("[setup] verifying setup...")
    
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM users")
    user_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM posts")
    post_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM conversations")
    convo_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM messages")
    msg_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM users WHERE people_recs IS NOT NULL")
    recs_count = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    print("")
    print("=" * 40)
    print("database setup complete!")
    print("=" * 40)
    print(f"  users:              {user_count}")
    print(f"  posts:              {post_count}")
    print(f"  conversations:      {convo_count}")
    print(f"  messages:           {msg_count}")
    print(f"  users with recs:    {recs_count}")
    print("=" * 40)
    
    return user_count > 0 and post_count > 0


def main():
    print("=" * 40)
    print("travelmate database setup")
    print("=" * 40)
    print(f"  database: {DB_NAME}")
    print(f"  user:     {DB_USER}")
    print(f"  host:     {DB_HOST}:{DB_PORT}")
    print("=" * 40)
    print("")
    
    try:
        create_database()
        create_schema()
        load_users()
        create_auth_credentials()
        load_posts()
        load_conversations()
        load_messages()
        generate_recommendations()
        verify_setup()
        
        print("")
        print("setup complete! you can now start the backend with:")
        print("  ./scripts/backend.sh")
        print("")
        
    except psycopg2.Error as e:
        print(f"[error] database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[error] unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
