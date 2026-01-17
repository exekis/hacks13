
import json
import psycopg2
import os

# Database connection parameters
DB_NAME = os.getenv("DB_NAME", "hacks13")
DB_USER = os.getenv("DB_USER", "jennifer")
DB_PASSWORD = os.getenv("DB_PASSWORD", "") # can leave password blank
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

# Path to the JSON file
USERS_FILE = os.getenv("USERS_FILE", "db/mock_data/fake_users.json")
POSTS_FILE = os.getenv("POSTS_FILE", "db/mock_data/posts.json")

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

# Read the JSON file
with open(USERS_FILE, 'r') as f:
    users_data = json.load(f)

# Iterate over the users and insert them into the database
for user in users_data:
    try:
        cur.execute(
            """INSERT INTO Users (userID, Name, Age, Email, pronouns, isStudent, university, currentCity, travelingTo, languages, hometown, agePreference, verifiedStudentsOnly, culturalIdentity, ethnicity, religion, culturalSimilarityImportance, culturalComfortLevel, languageMatchImportant, purposeOfStay, lookingFor, socialVibe, whoCanSeePosts, hideLocationUntilFriends, meetupPreference, boundaries, bio, AboutMe, Friends, recs)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb[])""",
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
                [json.dumps(rec) for rec in user["recs"]]
            )
        )
    except psycopg2.Error as e:
        print(f"Error inserting user {user["userID"]}: {e}")
        conn.rollback()
    else:
        conn.commit()

# -----------------------
# Load Posts
# -----------------------
with open(POSTS_FILE, "r", encoding="utf-8") as f:
    posts_data = json.load(f)

# posts.json format expected:
# {
#   "83017452": {"user_id": 482193, "time_posted": "...", "post_content": "...", "embedding": []},
#   ...
# }
# We ignore the JSON key PostID because your table uses SERIAL PostID.
# We also leave location_str/location_coords/embedding as NULL.

for post_key, post in posts_data.items():
    try:
        cur.execute(
            """
            INSERT INTO Posts (user_id, location_str, location_coords, time_posted, post_content, embedding)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                post["user_id"],
                None,   # location_str
                None,   # location_coords (POINT)
                post.get("time_posted"),  # expecting ISO8601 string; Postgres can parse it
                post.get("post_content"),
                None,   # embedding (INT[])
            ),
        )
    except psycopg2.Error as e:
        print(f"Error inserting post {post_key} (user_id={post.get('user_id')}): {e}")
        conn.rollback()
    else:
        conn.commit()

# Close the connection
cur.close()
conn.close()

print("Data loaded successfully!")
