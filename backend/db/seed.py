import json
from dotenv import load_dotenv
import psycopg2
import os

load_dotenv()
# -----------------------
# Config
# -----------------------
DB_NAME = os.getenv("DB_NAME", "hacks13")
DB_USER = os.getenv("DB_USER", "gabriel")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")  # can leave password blank
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

USERS_FILE = os.getenv("USERS_FILE", "backend/db/mock_data/profiles.json")
POSTS_FILE = os.getenv("POSTS_FILE", "backend/db/mock_data/posts.json")
CONVERSATIONS_FILE = os.getenv("CONVERSATIONS_FILE", "backend/db/mock_data/conversations.json")
MESSAGES_FILE = os.getenv("MESSAGES_FILE", "backend/db/mock_data/messages.json")
SCHEMA_FILE = os.getenv("SCHEMA_FILE", "backend/db/schema.sql")


# -----------------------
# Database Functions
# -----------------------
def recreate_tables(cur, conn, schema_file: str) -> None:
    """Drop and recreate all tables in the database."""
    with open(schema_file, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    
    # Remove the Auth table creation from the schema
    schema_sql = schema_sql.split("-- Create the Auth table")[0]

    cur.execute("DROP TABLE IF EXISTS Messages, Posts, Conversations, Users, Auth CASCADE;")
    cur.execute(schema_sql)
    conn.commit()
    print("Tables recreated successfully.")

# -----------------------
# Loaders
# -----------------------
def load_users(cur, conn, users_file: str) -> None:
    """Load users from JSON into the Users table."""
    with open(users_file, "r", encoding="utf-8") as f:
        users_data = json.load(f)
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
        except psycopg2.Error as e:
            print(f"Error inserting user {user.get('userid')}: {e}")
            conn.rollback()
        else:
            conn.commit()
        count += 1
    print(f"Loaded {count} users into DB")

def load_posts(cur, conn, posts_file: str) -> None:
    """Load posts from JSON into the Posts table."""
    with open(posts_file, "r", encoding="utf-8") as f:
        posts_data = json.load(f)

    # check if post_embedding column exists (for vector db support)
    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'post_embedding'
    """)
    has_embedding_column = cur.fetchone() is not None

    count = 0
    for post_key, post in posts_data.items():
        try:
            # check if user exists
            cur.execute("SELECT 1 FROM Users WHERE userID = %s", (post["user_id"],))
            if not cur.fetchone():
                # skip post if user not found
                continue

            if has_embedding_column and post.get("embedding"):
                # insert with embedding if column exists and data has embedding
                cur.execute(
                    """
                    INSERT INTO Posts (
                        PostID, user_id,
                        time_posted, content, post_embedding
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        int(post_key),
                        post["user_id"],
                        post.get("time_posted"),
                        post.get("post_content"),
                        post.get("embedding"),
                    ),
                )
            else:
                # insert without embedding
                cur.execute(
                    """
                        INSERT INTO Posts (
                            PostID,
                            user_id,
                            time_posted,
                            post_content
                        )
                        VALUES (%s, %s, %s, %s)
                        """,
                        (
                            int(post_key),
                            post["user_id"],
                            post.get("time_posted"),
                            post.get("post_content"),
                        ),
                    )
        except psycopg2.Error as e:
            print(f"Error inserting post {post_key} (user_id={post.get('user_id')}): {e}")
            conn.rollback()
        else:
            conn.commit()
        count += 1
    print(f"Loaded {count} posts into DB")


def load_conversations(cur, conn, conversations_file: str) -> None:
    """Load conversations from JSON into Conversations table."""
    with open(conversations_file, "r", encoding="utf-8") as f:
        conversations_data = json.load(f)

    count = 0
    for convo_key, convo in conversations_data.items():
        try:
            cur.execute("SELECT 1 FROM Users WHERE userID = %s", (convo["user_a"],))
            user_a_exists = cur.fetchone()
            cur.execute("SELECT 1 FROM Users WHERE userID = %s", (convo["user_b"],))
            user_b_exists = cur.fetchone()
            if user_a_exists and user_b_exists:
                cur.execute(
                    """
                    INSERT INTO Conversations (conversationID, user_a, user_b, last_messaged)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        int(convo.get("conversationID", convo_key)),
                        convo["user_a"],
                        convo["user_b"],
                        convo.get("last_messaged"),
                    ),
                )
        except psycopg2.Error as e:
            print(f"Error inserting conversation {convo_key}: {e}")
            conn.rollback()
        else:
            conn.commit()
        count += 1
    print(f"Loaded {count} conversations into DB")

def create_auth_table(cur, conn) -> None:
    """Create the Auth table."""
    cur.execute("DROP TABLE IF EXISTS Auth CASCADE;")
    cur.execute(
        """
        CREATE TABLE Auth (
            userID INT PRIMARY KEY REFERENCES Users(userID),
            password_hash VARCHAR(255) NOT NULL
        );
        """
    )
    conn.commit()
    print("Auth table created successfully.")

def load_messages(cur, conn, messages_file: str) -> None:
    """Load messages from JSON into the Messages table."""
    with open(messages_file, "r", encoding="utf-8") as f:
        messages_data = json.load(f)

    count = 0
    for msg_key, msg in messages_data.items():
        try:
            cur.execute("SELECT 1 FROM Conversations WHERE conversationID = %s", (msg["conversationID"],))
            convo_exists = cur.fetchone()
            cur.execute("SELECT 1 FROM Users WHERE userID = %s", (msg["senderID"],))
            sender_exists = cur.fetchone()
            if convo_exists and sender_exists:
                cur.execute(
                    """
                    INSERT INTO Messages (messageID, conversationID, senderID, message_content, timestamp)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        int(msg_key),
                        msg["conversationID"],
                        msg["senderID"],
                        msg["message_content"],
                        msg.get("timestamp"),
                    ),
                )
        except psycopg2.Error as e:
            print(f"Error inserting message {msg_key} (conversationID={msg.get('conversationID')}): {e}")
            conn.rollback()
        else:
            conn.commit()
        count += 1
    print(f"Loaded {count} messages into DB")

if __name__ == "__main__":
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
        )
        cur = conn.cursor()
    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
        raise SystemExit(1)

    try:
        recreate_tables(cur, conn, SCHEMA_FILE)
        load_users(cur, conn, USERS_FILE)
        load_posts(cur, conn, POSTS_FILE)
        load_conversations(cur, conn, CONVERSATIONS_FILE)
        load_messages(cur, conn, MESSAGES_FILE)
        create_auth_table(cur, conn)
    finally:
        cur.close()
        conn.close()
