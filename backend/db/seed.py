
import json
import psycopg2

# Database connection parameters
DB_NAME = "hacks13"
DB_USER = "gabriel"
DB_PASSWORD = ""
DB_HOST = "localhost"
DB_PORT = "5432"

# Path to the JSON file
JSON_FILE = "backend/db/mock_data/fake_users.json"

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
with open(JSON_FILE, 'r') as f:
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

# Close the connection
cur.close()
conn.close()

print("Data loaded successfully!")
