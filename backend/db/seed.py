import json
import psycopg2
import os

# -----------------------
# Config
# -----------------------
DB_NAME = os.getenv("DB_NAME", "hacks13")
DB_USER = os.getenv("DB_USER", "jennifer")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")  # can leave password blank
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

USERS_FILE = os.getenv("USERS_FILE", "backend/db/mock_data/fake_users.json")
POSTS_FILE = os.getenv("POSTS_FILE", "backend/db/mock_data/posts.json")


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
    finally:
        cur.close()
        conn.close()
