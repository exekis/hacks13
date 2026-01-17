import json
import random
from datetime import datetime, timedelta

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
    "Just moved here and feeling a bit lost. Anyone want to explore the city together?",
    "Looking for people who share my culture and want to celebrate upcoming holidays together.",
    "Is anyone interested in joining me for coffee and a chat this weekend?",
    "Trying to make friends in a new country is harder than I thought. Would love to meet others in the same boat.",
    "Planning to attend a local event soon and hoping not to go alone.",
    "Anyone here into photography or walking around the city taking pictures?",
    "Missing food from home a lot lately. Would be fun to cook together sometime.",
    "Thinking of starting a small group for language exchange and cultural sharing.",
    "Does anyone want to join me for a museum or gallery visit this week?",
    "New here and hoping to build a small circle of friends who understand the experience."
]

data = {}
post_id = 83017452
start_time = datetime(2025, 1, 1)

for uid in user_ids:
    for i in range(3):
        data[str(post_id)] = {
            "user_id": uid,
            "time_posted": (start_time + timedelta(minutes=random.randint(0, 200000))).isoformat() + "Z",
            "post_content": random.choice(post_templates),
            "embedding": []
        }
        post_id += 1

with open("posts.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Generated posts.json with 300 posts.")
