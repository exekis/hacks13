-- Commented out the drops cuz we're prob not changing the data anymore
--DROP TABLE IF EXISTS Messages;
--DROP TABLE IF EXISTS Posts;
--DROP TABLE IF EXISTS Conversations;
--DROP TABLE IF EXISTS Users;

CREATE EXTENSION IF NOT EXISTS vector;

-- Create the Users table
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
    people_recs JSONB,
    user_embedding vector(384)
);

-- Create the Posts table
CREATE TABLE IF NOT EXISTS Posts (
    PostID SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(userID),
    content TEXT,
    is_event BOOLEAN DEFAULT FALSE,
    time_posted TIMESTAMPTZ DEFAULT NOW()
);

-- Create the Conversations table
CREATE TABLE Conversations (
  conversationID SERIAL PRIMARY KEY,
  user_a INT NOT NULL,
  user_b INT NOT NULL,
  last_messaged TIMESTAMPTZ DEFAULT NOW(),
  user_low  INT GENERATED ALWAYS AS (LEAST(user_a, user_b)) STORED,
  user_high INT GENERATED ALWAYS AS (GREATEST(user_a, user_b)) STORED
);

-- Create the Messages table
CREATE TABLE Messages (
  messageID SERIAL PRIMARY KEY,
  conversationID INT NOT NULL,
  senderID INT NOT NULL,
  message_content TEXT NOT NULL,
  timestamp TIMESTAMTz DEFAULT NOW()
);

-- Create the Auth table
CREATE TABLE Auth (
    userID INT PRIMARY KEY REFERENCES Users(userID),
    password_hash VARCHAR(255) NOT NULL
);
