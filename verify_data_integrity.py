import json
import os

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

profiles = load_json('backend/db/mock_data/profiles.json')
conversations = load_json('backend/db/mock_data/conversations.json')
messages = load_json('backend/db/mock_data/messages.json')

# Create set of valid user IDs
valid_user_ids = {u['userid'] for u in profiles}

print(f"Total Users: {len(valid_user_ids)}")

missing_users_in_convo = set()
conversations_count = 0
valid_conversations_count = 0
valid_conversation_ids = set()

for cid, convo in conversations.items():
    conversations_count += 1
    ua = convo['user_a']
    ub = convo['user_b']
    
    missing = False
    if ua not in valid_user_ids:
        missing_users_in_convo.add(ua)
        missing = True
    if ub not in valid_user_ids:
        missing_users_in_convo.add(ub)
        missing = True
        
    if not missing:
        valid_conversations_count += 1
        valid_conversation_ids.add(int(cid))

print(f"Total Conversations: {conversations_count}")
print(f"Valid Conversations (both users exist): {valid_conversations_count}")
print(f"Missing User IDs referenced in conversations: {len(missing_users_in_convo)}")
# print(f"Missing User IDs: {missing_users_in_convo}")

messages_count = 0
valid_messages_count = 0
messages_missing_convo = 0
messages_missing_sender = 0

for mid, msg in messages.items():
    messages_count += 1
    cid = msg['conversationID']
    sender = msg['senderID']
    
    missing = False
    if cid not in valid_conversation_ids:
        messages_missing_convo += 1
        missing = True
    
    if sender not in valid_user_ids:
        messages_missing_sender += 1
        missing = True
        
    if not missing:
        valid_messages_count += 1

print(f"Total Messages: {messages_count}")
print(f"Valid Messages: {valid_messages_count}")
print(f"Messages referencing invalid Conversation: {messages_missing_convo}")
print(f"Messages referencing invalid Sender: {messages_missing_sender}")
