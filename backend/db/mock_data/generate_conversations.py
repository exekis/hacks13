import os
import json
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv
from google import genai

load_dotenv()

# -------------------------
# Inputs
# -------------------------
user_ids = [
    482193,739205,615847,902364,174826,560293,831740,294618,705392,468150,
    193746,850271,624905,317482,746209,590814,203685,918462,472590,685731
]

# A few starter "tones"/intent prompts to help Gemini vary
message_intents = [
    "making plans to explore the city",
    "asking about food from home / restaurants",
    "language exchange / practicing together",
    "inviting someone to a museum or gallery",
    "finding people to celebrate a cultural holiday",
    "meeting for coffee and getting to know each other",
    "asking for local tips (transit, neighborhoods, safety)",
    "joining a hobby meetup (photography, walking, sports)",
]

random.seed(42)

# Gemini client
api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

def _iso_z(dt: datetime) -> str:
    return dt.isoformat(timespec="seconds") + "Z"

def generate_message_text(intent: str) -> str:
    """
    Generate ONE short DM message max 1 sentences.
    No emojis, no hashtags, friendly + natural.
    Returns ONLY the message text.
    """
    prompt = f"""
You are writing a short direct message between two people who are new to a city and trying to connect.
Write ONE message (1-2 sentences max) with this intent: {intent}.

Constraints:
- 1 to 2 sentences
- No emojis
- No hashtags
- Keep it casual and specific (include a day/time or place type if possible)
- Return ONLY the message text
""".strip()

    resp = client.models.generate_content(
        model="gemini-2.0-flash-001",
        contents=prompt,
    )
    text = (resp.text or "").strip()

    # Guard: keep to 2 sentences
    parts = [p.strip() for p in text.replace("\n", " ").split(".") if p.strip()]
    if len(parts) > 2:
        text = ". ".join(parts[:2]) + "."
    return text

# -------------------------
# Generation settings
# -------------------------
NUM_CONVERSATIONS = 50            # tweak as you like
MIN_MESSAGES_PER_CONVO = 2
MAX_MESSAGES_PER_CONVO = 5

start_time = datetime(2025, 1, 1)

# -------------------------
# Generate conversations (unique user pairs)
# -------------------------
pairs = set()
conversations = {}
messages = {}

conversation_id_start = 7000000  # 7-digit int (optional for JSON; DB uses SERIAL)
message_id_start = 90000000      # 8-digit-ish int for JSON (optional; DB uses SERIAL)

conversation_id = conversation_id_start
message_id = message_id_start

# Create unique pairs, no self-messaging
while len(pairs) < NUM_CONVERSATIONS:
    a = random.choice(user_ids)
    b = random.choice(user_ids)
    if a == b:
        continue
    pair = tuple(sorted((a, b)))
    if pair in pairs:
        continue
    pairs.add(pair)

for (a, b) in pairs:
    # conversation row (JSON key is conversationID string)
    convo_key = str(conversation_id)

    # Decide number of messages
    n_msgs = random.randint(MIN_MESSAGES_PER_CONVO, MAX_MESSAGES_PER_CONVO)

    # Create a timeline for messages
    base = start_time + timedelta(minutes=random.randint(0, 250000))
    ts_list = sorted([base + timedelta(minutes=random.randint(0, 5000)) for _ in range(n_msgs)])

    # Alternate senders but with some randomness
    sender = a if random.random() < 0.5 else b

    convo_message_ids = []
    for i in range(n_msgs):
        # occasionally switch sender
        if i > 0 and random.random() < 0.45:
            sender = a if sender == b else b

        intent = random.choice(message_intents)
        content = generate_message_text(intent)

        msg_key = str(message_id)
        convo_message_ids.append(message_id)

        messages[msg_key] = {
            "conversationID": conversation_id,
            "senderID": sender,
            "message_content": content,
            "timestamp": _iso_z(ts_list[i]),
        }

        message_id += 1

    last_messaged = ts_list[-1]

    conversations[convo_key] = {
        "conversationID": conversation_id,
        "user_a": a,
        "user_b": b,
        "last_messaged": _iso_z(last_messaged),
        # helpful for loading/debugging (not required by schema)
        "message_ids": convo_message_ids,
    }

    conversation_id += 1

# -------------------------
# Write outputs
# -------------------------
out_convos = "backend/db/mock_data/conversations.json"
out_msgs = "backend/db/mock_data/messages.json"
os.makedirs(os.path.dirname(out_convos), exist_ok=True)

with open(out_convos, "w", encoding="utf-8") as f:
    json.dump(conversations, f, indent=2, ensure_ascii=False)

with open(out_msgs, "w", encoding="utf-8") as f:
    json.dump(messages, f, indent=2, ensure_ascii=False)

print(f"Generated {out_convos} with {len(conversations)} conversations.")
print(f"Generated {out_msgs} with {len(messages)} messages.")
