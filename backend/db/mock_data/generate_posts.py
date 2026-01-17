import os
import json
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from google import genai
load_dotenv()

user_ids = [
    482193,739205,615847,902364,174826,560293,831740,294618,705392,468150,
    193746,850271,624905,317482,746209,590814,203685,918462,472590,685731,
    104938,759204,386715,927540,548621,671394,294057,813746,465902,702581,
    158403,936274,540987,284695,761420,695218,309847,872561,514296,640782,
    192584,758306,403961,826475,571928,904317,268540,739816,650294,487203,
    915682,374905,206471,582630,748159,469582,813064,295740,670421,548372,
    724810,381694,962405,507183,816297,239584,690241,475862,820476,354917,
    946582,508391,174609,762584,435928,891460,203759,674281,529640,718394,
    360972,845206,297481,610759,483920,752618,194506,906241,538472,271984,
    684295,417638,963750,520184,739462,158972,804615,476293,691847,325704
]

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
        content = generate_post_text(post_templates)
        key = str(post_id)

        data[key] = {
            "user_id": uid,
            "time_posted": (start_time + timedelta(minutes=random.randint(0, 200000))).isoformat() + "Z",
            "post_content": content,
            "embedding": []
        }

        all_contents.append(content)
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