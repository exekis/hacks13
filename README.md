
<img width="937" height="238" alt="travelmate_banner" src="https://github.com/user-attachments/assets/2b007551-45bd-4b90-bab3-6c02eb55b7f7" />

<p align="left">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Python-428af7?logo=python&logoColor=FFFFFF" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-f65d7b?logo=postgresql&logoColor=FFFFFF" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-428af7.svg?logo=react&logoColor=ffffff" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0a9a8c?logo=fastapi&logoColor=FFFFFF" alt="FastAPI" />
  <img src="https://img.shields.io/github/repo-size/exekis/hacks13?color=f78875" alt="Repo size" />
</p>


# Travelmate

Travelmate helps people connect with their cultural identities and build real-life communities, no matter where they are. It’s a platform for finding and hosting events, sharing traditions, and making meaningful connections with others who have similar backgrounds and interests.

## About The Project

Being away from home can feel isolating. Travelmate was built to bridge that gap by connecting people with shared cultural backgrounds. Through self-hosted events and a smart recommendation system, our platform helps users build genuine communities. Whether it’s sharing a meal, celebrating a tradition, or just having a conversation, Travelmate makes it easier to find a piece of home, wherever you are.

## Key Features

*   **Event Hosting and Discovery:** Create and find cultural events hosted by community members.
*   **Personalized Recommendations:** A recommendation engine suggests people and events based on location, interests, cultural background, and more.
*   **Direct Messaging:** Connect and chat with new friends and acquaintances.
*   **User Profiles:** Create a profile that showcases your background, interests, and what you're looking for in a community.

## How It Works

Travelmate is powered by a robust backend that combines a custom-built PostgreSQL database with a sophisticated recommendation engine.

*   **PostgreSQL Backend:** Our database is the heart of the platform, handling everything from user authentication and direct messaging to event management. We designed a custom schema to ensure data integrity and efficient querying, allowing us to manage complex relationships between users, posts, and conversations.

*   **Recommendation Engine:** The recommendation system is designed to provide relevant and diverse suggestions for both people and events.
    *   **People Recommendations:** We generate a candidate pool from friends-of-friends and users with similar attributes, then calculate a compatibility score to rank the suggestions.
    *   **Post/Event Recommendations:** We use a hybrid approach. First, a deterministic scoring algorithm ranks posts based on a variety of factors. Second, we use vector embeddings (via `pgvector` and Hugging Face) to represent users and posts, and rank by cosine similarity. The final recommendations are a weighted combination of both methods.

This creates a powerful loop: the data from user interactions and profiles is fed into our recommendation algorithms, and the resulting recommendations are stored back in the database to be served to the users, creating a constantly improving and personalized experience.

## Project Structure

```
├── backend/          # FastAPI backend with recommendations API
├── frontend/         # Vite React frontend
└── scripts/          # Development scripts
```

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm
*   Python 3.8+ and pip
*   PostgreSQL

### Installation & Setup

1.  **Clone the repo**
    ```sh
    git clone https://github.com/exekis/hacks13.git
    cd hacks13
    ```

2.  **Database Setup**

    Make sure you have PostgreSQL installed and running. Then, run the setup script:
    ```sh
    ./scripts/db-setup.sh
    ```
    This will create the database, tables, and seed it with sample data.

    **Note on Database Connection:**
    The backend connects to PostgreSQL using environment variables. You can create a `.env` file in the `backend` directory to configure your database connection. If you don't, it will use default values.
    ```
    # backend/.env
    DB_NAME=hacks13
    DB_USER=your_username
    DB_HOST=localhost
    DB_PORT=5432
    DB_PASSWORD=your_password
    ```

3.  **Setup the Backend (Terminal 1)**

    Create and activate a virtual environment:
    ```sh
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
    ```

    Then, run the backend server using the script:
    ```sh
    ./scripts/backend.sh
    ```

4.  **Setup the Frontend (Terminal 2)**
    ```sh
    cd frontend
    npm install
    npm run dev
    ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8000`.

## What's Next

*   A mobile app version of Travelmate.
*   Exploring more advanced recommendation algorithms like collaborative filtering.
