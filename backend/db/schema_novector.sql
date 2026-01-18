-- schema without vector extension for systems that don't have pgvector installed
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS Users (
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

CREATE TABLE IF NOT EXISTS Posts (
    PostID SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(userID),
    location_str TEXT,
    post_content TEXT,
    is_event BOOLEAN DEFAULT FALSE,
    time_posted TIMESTAMPTZ DEFAULT NOW(),
    rsvps INT[],
    capacity INT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS Conversations (
  conversationID SERIAL PRIMARY KEY,
  user_a INT NOT NULL,
  user_b INT NOT NULL,
  last_messaged TIMESTAMPTZ DEFAULT NOW(),
  user_low  INT GENERATED ALWAYS AS (LEAST(user_a, user_b)) STORED,
  user_high INT GENERATED ALWAYS AS (GREATEST(user_a, user_b)) STORED
);

CREATE TABLE IF NOT EXISTS Messages (
  messageID SERIAL PRIMARY KEY,
  conversationID INT NOT NULL,
  senderID INT NOT NULL,
  message_content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
