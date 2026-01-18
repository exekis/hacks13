import os
import json
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from google import genai
load_dotenv()

# load valid user ids from profiles.json to ensure referential integrity
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(SCRIPT_DIR, "profiles.json"), "r", encoding="utf-8") as f:
    profiles = json.load(f)
user_ids = [u["userid"] for u in profiles]

post_templates = [
    "Just moved to Toronto from Mexico and feeling a bit lost. Anyone want to explore the city together?",
    "Looking for people who share my culture and want to celebrate upcoming holidays together.",
    "Is anyone interested in joining me for coffee and a chat this weekend?",
    "Trying to make friends in a new country is harder than I thought. Would love to meet others in the same boat.",
    "Planning to attend a local event soon and hoping not to go alone.",
    "Anyone here into photography or walking around the city taking pictures?",
    "Missing food from home a lot lately. Would be fun to cook together sometime.",
    "Thinking of starting a small group for Chinese language exchange and cultural sharing.",
    "Does anyone want to join me for a museum or gallery visit this week?",
]

random.seed(42)

api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

def generate_post_text(templates: list[str]) -> str:
    prompt = f"""
You write short, friendly posts for a social app where people new to a city want to connect.
Write ONE post (max 3 sentences). It should feel natural and specific (mention a place type, day/time idea, or small detail).
Do NOT copy any template verbatim, but you can take inspiration from them.

Templates for inspiration:
{chr(10).join([f"- {t}" for t in templates])}

Constraints:
- Max 3 sentences total
- No hashtags
- No emojis
- Avoid overly generic lines like "let's hang out sometime"
- Make it inviting: ask a clear question at the end

Return ONLY the post text, nothing else.
""".strip()

    resp = client.models.generate_content(
        model="gemini-2.0-flash-001",
        contents=prompt,
    )
    text = (resp.text or "").strip()

    # Ensure <= 3 sentences (simple guard)
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
    if len(sentences) > 3:
        text = ". ".join(sentences[:3]) + "."
    return text


data = {}
post_id = 83017452
start_time = datetime(2025, 1, 1)

all_contents = []
post_keys_in_order = []

for uid in user_ids:
    for _ in range(3):
        post_content = generate_post_text(post_templates)
        key = str(post_id)

        data[key] = {
            "user_id": uid,
            "time_posted": (start_time + timedelta(minutes=random.randint(0, 200000))).isoformat() + "Z",
            "post_content": post_content,
            "embedding": []
        }

        all_contents.append(post_content)
        post_keys_in_order.append(key)
        post_id += 1

# Embeddings (local)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
emb = model.encode(all_contents, convert_to_numpy=True, normalize_embeddings=True)

for key, vec in zip(post_keys_in_order, emb):
    data[key]["embedding"] = vec.tolist()

out_path = "backend/db/mock_data/posts.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Generated {out_path} with {len(data)} posts + embeddings.")