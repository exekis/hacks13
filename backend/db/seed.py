import json
import psycopg2
import os

# -----------------------
# Config
# -----------------------
DB_NAME = os.getenv("DB_NAME", "hacks13")
DB_USER = os.getenv("DB_USER", "gabriel")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")  # can leave password blank
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

USERS_FILE = os.getenv("USERS_FILE", "backend/db/mock_data/fake_users.json")
POSTS_FILE = os.getenv("POSTS_FILE", "backend/db/mock_data/posts.json")
CONVERSATIONS_FILE = os.getenv("CONVERSATIONS_FILE", "backend/db/mock_data/conversations.json")
MESSAGES_FILE = os.getenv("MESSAGES_FILE", "backend/db/mock_data/messages.json")


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
                    travelingTo, languages, hometown, agePreference, verifiedStudentsOnly,
                    culturalIdentity, ethnicity, religion, culturalSimilarityImportance,
                    culturalComfortLevel, languageMatchImportant, purposeOfStay, lookingFor,
                    socialVibe, whoCanSeePosts, hideLocationUntilFriends, meetupPreference,
                    boundaries, bio, AboutMe, Friends, recs
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s::jsonb[]
                )
                """,
                (
                    user["userID"],
                    user["Name"],
                    user["Age"],
                    user["Email"],
                    user["pronouns"],
                    user["isStudent"],
                    user["university"],
                    user["currentCity"],
                    user["travelingTo"],
                    user["languages"],
                    user["hometown"],
                    user["agePreference"],
                    user["verifiedStudentsOnly"],
                    user["culturalIdentity"],
                    user["ethnicity"],
                    user["religion"],
                    user["culturalSimilarityImportance"],
                    user["culturalComfortLevel"],
                    user["languageMatchImportant"],
                    user["purposeOfStay"],
                    user["lookingFor"],
                    user["socialVibe"],
                    user["whoCanSeePosts"],
                    user["hideLocationUntilFriends"],
                    user["meetupPreference"],
                    user["boundaries"],
                    user["bio"],
                    user["AboutMe"],
                    user["Friends"],
                    [json.dumps(rec) for rec in user["recs"]],
                ),
            )
        except psycopg2.Error as e:
            print(f"Error inserting user {user.get('userID')}: {e}")
            conn.rollback()
        else:
            conn.commit()
        count += 1
    print(f"Loaded {count} users into DB")


def load_posts(cur, conn, posts_file: str) -> None:
    """Load posts from JSON into the Posts table."""
    with open(posts_file, "r", encoding="utf-8") as f:
        posts_data = json.load(f)

    # posts.json expected shape:
    # {
    #   "83017452": {"user_id": 482193, "time_posted": "...", "post_content": "...", "embedding": [...]},
    #   ...
    # }
    count = 0
    for post_key, post in posts_data.items():
        try:
            cur.execute(
                """
                    INSERT INTO Posts (
                        PostID,
                        user_id,
                        location_str,
                        location_coords,
                        time_posted,
                        post_content,
                        post_embedding
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        int(post_key),          # <-- this is the JSON key, converted to int
                        post["user_id"],
                        None,                   # location_str
                        None,                   # location_coords
                        post.get("time_posted"),
                        post.get("post_content"),
                        post.get("embedding"),
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
    """
    Load conversations from JSON into Conversations table.
    Ensures JSON conversationID (e.g., 7000000) is used as the DB PK.
    """
    with open(conversations_file, "r", encoding="utf-8") as f:
        conversations_data = json.load(f)

    count = 0
    for convo_key, convo in conversations_data.items():
        try:
            cur.execute(
                """
                INSERT INTO Conversations (conversationID, user_a, user_b, last_messaged)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (conversationID) DO NOTHING;
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

    # Fix conversations serial sequence so future inserts work
    try:
        cur.execute(
            """
            SELECT setval(
              pg_get_serial_sequence('conversations', 'conversationid'),
              (SELECT MAX(conversationid) FROM conversations)
            );
            """
        )
        conn.commit()
    except psycopg2.Error as e:
        print(f"Warning: could not reset conversations sequence: {e}")
        conn.rollback()


def load_messages(cur, conn, messages_file: str) -> None:
    """
    Load messages from JSON into Messages table.
    Ensures JSON messageID (e.g., 90000000) is used as the DB PK.
    """
    with open(messages_file, "r", encoding="utf-8") as f:
        messages_data = json.load(f)

    count = 0
    for msg_key, msg in messages_data.items():
        try:
            cur.execute(
                """
                INSERT INTO Messages (messageID, conversationID, senderID, message_content, timestamp)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (messageID) DO NOTHING;
                """,
                (
                    int(msg_key),                 # ensure message id included
                    msg["conversationID"],        # ensure conversation id included
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

    # Fix messages serial sequence so future inserts work
    try:
        cur.execute(
            """
            SELECT setval(
              pg_get_serial_sequence('messages', 'messageid'),
              (SELECT MAX(messageid) FROM messages)
            );
            """
        )
        conn.commit()
    except psycopg2.Error as e:
        print(f"Warning: could not reset messages sequence: {e}")
        conn.rollback()

    # Ensure Conversations.last_messaged matches the most recent message timestamp
    # (Your JSON already provides last_messaged, but this guarantees consistency.)
    try:
        cur.execute(
            """
            UPDATE Conversations c
            SET last_messaged = m.max_ts
            FROM (
              SELECT conversationID, MAX(timestamp) AS max_ts
              FROM Messages
              GROUP BY conversationID
            ) m
            WHERE c.conversationID = m.conversationID;
            """
        )
        conn.commit()
    except psycopg2.Error as e:
        print(f"Warning: could not update conversations.last_messaged from messages: {e}")
        conn.rollback()


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
        load_users(cur, conn, USERS_FILE)
        load_posts(cur, conn, POSTS_FILE)
        load_conversations(cur, conn, CONVERSATIONS_FILE)
        load_messages(cur, conn, MESSAGES_FILE)
    finally:
        cur.close()
        conn.close()
