from __future__ import annotations

from typing import Optional, List, Dict, Any

from psycopg2.extras import RealDictCursor
from app.services.helpers.db_helpers import get_conn

def get_conversations(user_id: int) -> List[Dict[str, Any]]:
    """
    Returns all the friends that a user has had a conversation with and the last message in that conversation,
    ordered by most recent first.

    should return friend_name, timestamp, last_message
    """
    sql_get_conversations = """
        SELECT
            c.conversationID,
            CASE WHEN c.user_a = %s THEN c.user_b ELSE c.user_a END AS friend_user_id,
            u.name AS friend_name,
            m.message_content AS last_message,
            m.timestamp AS last_message_time,
            c.last_messaged
        FROM Conversations c
        JOIN Users u
          ON u.userID = CASE WHEN c.user_a = %s THEN c.user_b ELSE c.user_a END
        LEFT JOIN LATERAL (
            SELECT message_content, timestamp
            FROM Messages
            WHERE conversationID = c.conversationID
            ORDER BY timestamp DESC
            LIMIT 1
        ) m ON TRUE
        WHERE c.user_a = %s OR c.user_b = %s
        ORDER BY c.last_messaged DESC;
    """

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql_get_conversations, (user_id, user_id, user_id, user_id))
            return cur.fetchall()
    finally:
        conn.close()


def send_message(
    user_id: int,
    friend_id: int,
    message_content: str,
) -> Dict[str, Any]:
    """
    Adds message to Messages table when the user sends a message to a friend with friend_id.

    - Ensures a 1:1 conversation exists (create if missing)
    - Inserts message
    - Updates Conversations.last_messaged
    Returns basic info about the created message.
    """
    if not message_content or not message_content.strip():
        raise ValueError("message_content cannot be empty")

    sql_upsert_conversation = """
        INSERT INTO Conversations (user_a, user_b, last_messaged)
        VALUES (%s, %s, NOW())
        RETURNING conversationID;
    """

    sql_insert_message = """
        INSERT INTO Messages (conversationID, senderID, message_content, timestamp)
        VALUES (%s, %s, %s, NOW())
        RETURNING messageID, conversationID, senderID, message_content, timestamp;
    """

    sql_touch_conversation = """
        UPDATE Conversations
        SET last_messaged = NOW()
        WHERE conversationID = %s;
    """

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Ensure consistent ordering for the unique constraint
            a, b = (user_id, friend_id) if user_id < friend_id else (friend_id, user_id)

            cur.execute(sql_upsert_conversation, (a, b))
            convo_row = cur.fetchone()
            if not convo_row:
                raise RuntimeError("Failed to create or fetch conversation")
            convo_id = convo_row["conversationid"]

            cur.execute(sql_insert_message, (convo_id, user_id, message_content.strip()))
            msg_row = cur.fetchone()
            if not msg_row:
                raise RuntimeError("Failed to insert message")

            # Keep last_messaged correct
            cur.execute(sql_touch_conversation, (convo_id,))

        conn.commit()
        return msg_row

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def open_conversation(
    user_id: int,
    friend_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Retrieves all messages between user_id and their friend, friend_id, ordered from least to most recent.
    If friend_id is not given, open the conversation between the user and the MOST RECENT
    friend who they conversed with.

    Returns:
      {
        "conversationID": int | None,
        "friend_user_id": int | None,
        "friend_name": str | None,
        "messages": [ {messageID, senderID, message_content, timestamp}, ... ]
      }
    """
    sql_get_most_recent_convo = """
        SELECT
            conversationID,
            CASE WHEN user_a = %s THEN user_b ELSE user_a END AS friend_user_id
        FROM Conversations
        WHERE user_a = %s OR user_b = %s
        ORDER BY last_messaged DESC
        LIMIT 1;
    """

    sql_get_convo_for_pair = """
        SELECT conversationID
        FROM Conversations
        WHERE (user_a = %s AND user_b = %s)
           OR (user_a = %s AND user_b = %s)
        LIMIT 1;
    """

    sql_get_friend_name = """
        SELECT name
        FROM Users
        WHERE userID = %s;
    """

    sql_get_messages = """
        SELECT messageID, senderID, message_content, timestamp
        FROM Messages
        WHERE conversationID = %s
        ORDER BY timestamp ASC;
    """

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Determine which conversation to open
            if friend_id is None:
                cur.execute(sql_get_most_recent_convo, (user_id, user_id, user_id))
                row = cur.fetchone()
                if not row:
                    return {"conversationID": None, "friend_user_id": None, "friend_name": None, "messages": []}
                conversation_id = row["conversationid"]
                friend_user_id = row["friend_user_id"]
            else:
                a, b = (user_id, friend_id) if user_id < friend_id else (friend_id, user_id)
                cur.execute(sql_get_convo_for_pair, (a, b, b, a))
                row = cur.fetchone()
                if not row:
                    # No conversation yet: return empty thread metadata (still show friend name if exists)
                    cur.execute(sql_get_friend_name, (friend_id,))
                    f = cur.fetchone()
                    return {
                        "conversationID": None,
                        "friend_user_id": friend_id,
                        "friend_name": f["name"] if f else None,
                        "messages": [],
                    }
                conversation_id = row["conversationid"]
                friend_user_id = friend_id

            # Get friend name
            cur.execute(sql_get_friend_name, (friend_user_id,))
            friend_row = cur.fetchone()
            friend_name = friend_row["name"] if friend_row else None

            # Get messages
            cur.execute(sql_get_messages, (conversation_id,))
            messages = cur.fetchall()

        return {
            "conversationID": conversation_id,
            "friend_user_id": friend_user_id,
            "friend_name": friend_name,
            "messages": messages,
        }
    finally:
        conn.close()


if __name__ == "__main__":
    test_user_id = 482193
    test_friend_id = 739205

    print("\n--- Testing get_conversations ---")
    conversations = get_conversations(test_user_id)
    for c in conversations:
        print(c)

    print("\n--- Testing send_message ---")
    msg = send_message(
        user_id=test_user_id,
        friend_id=test_friend_id,
        message_content="Hi how are u"
    )
    print("Inserted message:", msg)

    print("\n--- Testing open_conversation (specific friend) ---")
    convo = open_conversation(test_user_id, test_friend_id)
    print(convo["conversationID"], convo["friend_name"])
    for m in convo["messages"][-5:]:
        print(m)

    print("\n--- Testing open_conversation (most recent) ---")
    recent = open_conversation(test_user_id)
    print(recent["conversationID"], recent["friend_name"])
    for m in recent["messages"][-5:]:
        print(m)
