DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Conversations;
DROP TABLE IF EXISTS Users;

CREATE EXTENSION IF NOT EXISTS vector;

-- Create the Users table
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
    people_recs JSONB,
    user_embedding vector(384)
);

-- Create the Posts table
CREATE TABLE Posts (
    PostID SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(userID),
    location_str VARCHAR(255),
    location_coords POINT,
    time_posted TIMESTAMPTZ DEFAULT NOW(),
    post_content TEXT,
    post_embedding vector(384)
);

-- Create the Conversations table
CREATE TABLE Conversations (
    conversationID SERIAL PRIMARY KEY,
    participants INT[]
);

-- Create the Messages table
CREATE TABLE Messages (
    MessageID SERIAL PRIMARY KEY,
    conversationID INT REFERENCES Conversations(conversationID),
    SenderID INT REFERENCES Users(userID),
    Content TEXT,
    Timestamp TIMESTAMPTZ DEFAULT NOW()
);
