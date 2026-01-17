"""
demo data fixtures for the recommendation system

this module provides in-memory demo data for testing
designed to be easily swapped with database queries later
"""

from datetime import datetime, date, timedelta
from typing import TypedDict

from app.models.recommendation import UserProfile, Post


class DemoState(TypedDict):
    """structure for all demo data"""
    users: dict[str, UserProfile]
    posts: dict[str, Post]
    friends: dict[str, set[str]]  # user_id -> set of friend user_ids
    blocks: dict[str, set[str]]   # user_id -> set of blocked user_ids
    likes: dict[str, set[str]]    # post_id -> set of user_ids who liked


def _create_demo_users() -> dict[str, UserProfile]:
    """create 12 diverse demo users"""
    
    now = datetime.now()
    
    users = {
        "user_1": UserProfile(
            id="user_1",
            display_name="Priya Sharma",
            age=22,
            verified_student=True,
            age_verified=True,
            current_city="Toronto",
            destination_city="Montreal",
            cultural_backgrounds=["Indian", "South Asian"],
            languages=["English", "Hindi", "Punjabi"],
            goals=["Friends", "Food buddies", "Exploring the city"],
            bio="Looking to explore Toronto and make friends who love good food!",
            created_at=now - timedelta(days=30),
            last_active_at=now - timedelta(hours=2),
            prefer_near_age=True,
        ),
        "user_2": UserProfile(
            id="user_2",
            display_name="Marcus Chen",
            age=23,
            verified_student=True,
            age_verified=True,
            current_city="Vancouver",
            destination_city="Toronto",
            cultural_backgrounds=["Taiwanese", "East Asian"],
            languages=["English", "Mandarin"],
            goals=["Study pals", "Food buddies", "Friends"],
            bio="CS student from Taiwan. Down for study sessions and late-night bubble tea runs!",
            created_at=now - timedelta(days=60),
            last_active_at=now - timedelta(hours=5),
        ),
        "user_3": UserProfile(
            id="user_3",
            display_name="Fatima Al-Rashid",
            age=24,
            verified_student=True,
            age_verified=True,
            current_city="Montreal",
            destination_city=None,
            cultural_backgrounds=["Arab", "Middle Eastern"],
            languages=["English", "Arabic", "French", "Persian"],
            goals=["Friends", "Exploring the city", "Events"],
            bio="New to Montreal! Love coffee shops, art galleries, and deep conversations.",
            created_at=now - timedelta(days=45),
            last_active_at=now - timedelta(hours=1),
        ),
        "user_4": UserProfile(
            id="user_4",
            display_name="Diego Santos",
            age=25,
            verified_student=True,
            age_verified=True,
            current_city="Toronto",
            destination_city=None,
            cultural_backgrounds=["Brazilian", "Latin American"],
            languages=["Portuguese", "English", "Spanish"],
            goals=["Gym", "Friends", "Exploring the city"],
            bio="Brazilian exchange student looking for gym buddies and weekend adventures!",
            created_at=now - timedelta(days=20),
            last_active_at=now - timedelta(days=1),
        ),
        "user_5": UserProfile(
            id="user_5",
            display_name="Amara Okonkwo",
            age=26,
            verified_student=True,
            age_verified=True,
            current_city="Toronto",
            destination_city="Vancouver",
            cultural_backgrounds=["Nigerian", "West African"],
            languages=["English", "Igbo", "Yoruba"],
            goals=["Friends", "Food buddies", "Events"],
            bio="Nigerian grad student. Always up for trying new restaurants and cultural events.",
            created_at=now - timedelta(days=90),
            last_active_at=now - timedelta(hours=12),
        ),
        "user_6": UserProfile(
            id="user_6",
            display_name="Yuki Tanaka",
            age=21,
            verified_student=True,
            age_verified=True,
            current_city="Vancouver",
            destination_city=None,
            cultural_backgrounds=["Japanese", "East Asian"],
            languages=["Japanese", "English"],
            goals=["Friends", "Food buddies", "Exploring the city"],
            bio="Japanese exchange student. Lets grab ramen and explore hidden spots!",
            created_at=now - timedelta(days=10),  # new user
            last_active_at=now - timedelta(hours=3),
        ),
        "user_7": UserProfile(
            id="user_7",
            display_name="Alex Kim",
            age=24,
            verified_student=True,
            age_verified=True,
            current_city="Toronto",
            destination_city=None,
            cultural_backgrounds=["Korean", "East Asian"],
            languages=["English", "Korean"],
            goals=["Roommates", "Friends", "Study pals"],
            bio="Korean-Canadian looking for roommates and people to share apartment hunting tips.",
            created_at=now - timedelta(days=100),
            last_active_at=now - timedelta(days=2),
        ),
        "user_8": UserProfile(
            id="user_8",
            display_name="Sofia Martinez",
            age=22,
            verified_student=True,
            age_verified=True,
            current_city="Montreal",
            destination_city="Toronto",
            cultural_backgrounds=["Mexican", "Latin American"],
            languages=["Spanish", "English", "French"],
            goals=["Friends", "Events", "Exploring the city"],
            bio="Mexican student passionate about dance, music, and making new connections!",
            created_at=now - timedelta(days=50),
            last_active_at=now - timedelta(hours=6),
        ),
        "user_9": UserProfile(
            id="user_9",
            display_name="Hassan Javed",
            age=27,
            verified_student=True,
            age_verified=True,
            current_city="Toronto",
            destination_city="Montreal",
            cultural_backgrounds=["Pakistani", "South Asian"],
            languages=["English", "Urdu", "Punjabi", "Persian"],
            goals=["Study pals", "Friends", "Events"],
            bio="Pakistani engineer. Coffee addict looking for study groups and cricket fans.",
            created_at=now - timedelta(days=80),
            last_active_at=now - timedelta(hours=8),
            prefer_near_age=True,
        ),
        "user_10": UserProfile(
            id="user_10",
            display_name="Linh Nguyen",
            age=23,
            verified_student=True,
            age_verified=True,
            current_city="Toronto",
            destination_city=None,
            cultural_backgrounds=["Vietnamese", "Southeast Asian"],
            languages=["Vietnamese", "English"],
            goals=["Friends", "Food buddies", "Exploring the city"],
            bio="Vietnamese student new to Canada. Would love to find cooking partners!",
            created_at=now - timedelta(days=5),  # new user
            last_active_at=now - timedelta(minutes=30),
        ),
        "user_11": UserProfile(
            id="user_11",
            display_name="Ibrahim Diallo",
            age=25,
            verified_student=True,
            age_verified=True,
            current_city="Montreal",
            destination_city=None,
            cultural_backgrounds=["Senegalese", "West African"],
            languages=["French", "English", "Wolof"],
            goals=["Friends", "Gym", "Study pals"],
            bio="Senegalese student passionate about tech and basketball. Lets connect!",
            created_at=now - timedelta(days=70),
            last_active_at=now - timedelta(days=1),
        ),
        "user_12": UserProfile(
            id="user_12",
            display_name="Zara Patel",
            age=24,
            verified_student=True,
            age_verified=True,
            current_city="Vancouver",
            destination_city="Toronto",
            cultural_backgrounds=["Indian", "British", "South Asian"],
            languages=["English", "Gujarati", "Hindi", "Persian"],
            goals=["Friends", "Food buddies", "Study pals"],
            bio="British-Indian grad student. Chai enthusiast seeking fellow bookworms and cafe hoppers.",
            created_at=now - timedelta(days=40),
            last_active_at=now - timedelta(hours=4),
        ),
    }
    
    return users


def _create_demo_posts() -> dict[str, Post]:
    """create 8 demo posts"""
    
    now = datetime.now()
    today = date.today()
    
    posts = {
        "post_1": Post(
            id="post_1",
            author_id="user_1",
            text="Hey! Ill be in Montreal from Feb 2 to Feb 12. Looking for friends to explore the city—message me!",
            created_at=now - timedelta(hours=2),
            start_date=today + timedelta(days=15),
            end_date=today + timedelta(days=25),
            coarse_location="Downtown Montreal",
            tags=["Friends", "Exploring the city"],
        ),
        "post_2": Post(
            id="post_2",
            author_id="user_3",
            text="Anyone want to check out the new art exhibit at the museum this weekend? Would love some company!",
            created_at=now - timedelta(hours=5),
            coarse_location="Montreal arts district",
            tags=["Events", "Friends"],
        ),
        "post_3": Post(
            id="post_3",
            author_id="user_4",
            text="Looking for a gym buddy in the downtown area. I usually go in the mornings around 7am. Lets motivate each other!",
            created_at=now - timedelta(days=1),
            coarse_location="Downtown Toronto",
            tags=["Gym", "Friends"],
        ),
        "post_4": Post(
            id="post_4",
            author_id="user_8",
            text="Organizing a salsa night next Friday! If you love dancing or want to learn, come join us. All levels welcome!",
            created_at=now - timedelta(days=1),
            start_date=today + timedelta(days=7),
            end_date=today + timedelta(days=7),
            coarse_location="Montreal downtown",
            tags=["Events", "Friends"],
        ),
        "post_5": Post(
            id="post_5",
            author_id="user_6",
            text="Found the best ramen spot near campus! Anyone want to grab lunch tomorrow? DM me!",
            created_at=now - timedelta(days=2),
            coarse_location="Near UBC campus",
            tags=["Food buddies", "Friends"],
        ),
        "post_6": Post(
            id="post_6",
            author_id="user_2",
            text="Study group forming for CPSC 320. Looking for 2-3 more people. We meet Tuesdays and Thursdays at the library.",
            created_at=now - timedelta(days=2),
            coarse_location="UBC Library area",
            tags=["Study pals"],
        ),
        "post_7": Post(
            id="post_7",
            author_id="user_7",
            text="Apartment hunting in North York. Anyone else looking for a place? Maybe we can be roommates! Budget: $800-1000/month",
            created_at=now - timedelta(days=3),
            coarse_location="North York area",
            tags=["Roommates"],
        ),
        "post_8": Post(
            id="post_8",
            author_id="user_9",
            text="Cricket match this Sunday at the park! We need 2 more players. All skill levels welcome, just come have fun!",
            created_at=now - timedelta(days=3),
            start_date=today + timedelta(days=2),
            end_date=today + timedelta(days=2),
            coarse_location="Toronto East",
            tags=["Events", "Friends"],
        ),
    }
    
    return posts


def _create_demo_friends() -> dict[str, set[str]]:
    """
    create friendship graph enabling friends-of-friends
    friendships are bidirectional
    """
    
    friends: dict[str, set[str]] = {
        "user_1": {"user_4", "user_5", "user_9"},
        "user_2": {"user_6", "user_12"},
        "user_3": {"user_8", "user_11"},
        "user_4": {"user_1", "user_7", "user_10"},
        "user_5": {"user_1", "user_10"},
        "user_6": {"user_2", "user_12"},
        "user_7": {"user_4", "user_10"},
        "user_8": {"user_3", "user_11"},
        "user_9": {"user_1"},
        "user_10": {"user_4", "user_5", "user_7"},
        "user_11": {"user_3", "user_8"},
        "user_12": {"user_2", "user_6"},
    }
    
    return friends


def _create_demo_blocks() -> dict[str, set[str]]:
    """create block relationships for testing filtering"""
    
    blocks: dict[str, set[str]] = {
        "user_1": set(),
        "user_2": {"user_9"},  # marcus blocked hassan
        "user_3": set(),
        "user_4": set(),
        "user_5": set(),
        "user_6": set(),
        "user_7": {"user_11"},  # alex blocked ibrahim
        "user_8": set(),
        "user_9": set(),
        "user_10": set(),
        "user_11": set(),
        "user_12": set(),
    }
    
    return blocks


def _create_demo_likes() -> dict[str, set[str]]:
    """create likes for posts to enable liked-by-friends logic"""
    
    likes: dict[str, set[str]] = {
        "post_1": {"user_4", "user_5", "user_9"},  # priya's friends liked her post
        "post_2": {"user_8", "user_11", "user_1"},
        "post_3": {"user_1", "user_7", "user_10"},
        "post_4": {"user_3", "user_11", "user_1", "user_5"},
        "post_5": {"user_2", "user_12"},
        "post_6": {"user_6", "user_12", "user_7"},
        "post_7": {"user_4", "user_10", "user_1"},
        "post_8": {"user_1", "user_4", "user_5"},
    }
    
    return likes


# module-level singleton for demo state
_demo_state: DemoState | None = None


def get_demo_state() -> DemoState:
    """
    get the demo state singleton
    
    this function ensures we use the same demo data throughout the app
    in production this would be replaced with database queries
    """
    global _demo_state
    
    if _demo_state is None:
        _demo_state = {
            "users": _create_demo_users(),
            "posts": _create_demo_posts(),
            "friends": _create_demo_friends(),
            "blocks": _create_demo_blocks(),
            "likes": _create_demo_likes(),
        }
    
    return _demo_state


def reset_demo_state() -> None:
    """reset demo state - useful for testing"""
    global _demo_state
    _demo_state = None
