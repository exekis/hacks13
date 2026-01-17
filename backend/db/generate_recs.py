"""
generate mock recommendations for all users
run: DB_USER=$(whoami) DB_NAME=hacks13 python backend/db/generate_recs.py

this script generates random recommendations when pgvector is not available
for vector-based recommendations, install pgvector and use the store_*_recs scripts
"""

import json
import psycopg2
import os
import random
from psycopg2.extras import Json

DB_NAME = os.getenv('DB_NAME', 'hacks13')
DB_USER = os.getenv('DB_USER', 'jennifer')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')


def check_vector_available(conn) -> bool:
    """check if pgvector extension is enabled"""
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector'")
    result = cur.fetchone()[0] > 0
    cur.close()
    return result


def generate_random_recs(conn):
    """generate random recommendations for all users"""
    cur = conn.cursor()

    # get all user ids
    cur.execute('SELECT userid FROM users')
    user_ids = [row[0] for row in cur.fetchall()]
    print(f'Found {len(user_ids)} users')

    # get all posts
    cur.execute('SELECT postid, user_id FROM posts')
    posts = cur.fetchall()
    print(f'Found {len(posts)} posts')

    # for each user, generate recommendations
    for i, uid in enumerate(user_ids):
        # get other users for people recommendations (exclude self)
        other_users = [u for u in user_ids if u != uid]
        random.shuffle(other_users)
        people_recs = [{'userid': u, 'score': round(random.random(), 3)} for u in other_users[:30]]

        # get posts not by this user for event recommendations
        other_posts = [p[0] for p in posts if p[1] != uid]
        random.shuffle(other_posts)
        event_recs = [{'postid': p, 'distance': round(random.random(), 3)} for p in other_posts[:50]]

        # update user with people_recs (jsonb)
        cur.execute(
            'UPDATE users SET people_recs = %s::jsonb WHERE userid = %s',
            (Json(people_recs), uid)
        )

        # update user with event_recs_emb (jsonb[])
        event_recs_json = [Json(e) for e in event_recs]
        cur.execute(
            'UPDATE users SET event_recs_emb = %s::jsonb[] WHERE userid = %s',
            (event_recs_json, uid)
        )
        
        conn.commit()

        if (i + 1) % 20 == 0:
            print(f'Processed {i + 1}/{len(user_ids)} users')

    print(f'Generated recommendations for all {len(user_ids)} users')
    cur.close()


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    
    # check if vector is available
    if check_vector_available(conn):
        print('pgvector detected - but using random recs for simplicity')
        print('for vector-based recs, run the store_*_recs scripts directly')
    else:
        print('pgvector not available - using random recommendations')
    
    generate_random_recs(conn)
    
    # verify one user
    cur = conn.cursor()
    cur.execute('SELECT userid, jsonb_array_length(people_recs), array_length(event_recs_emb, 1) FROM users WHERE userid = 482193')
    row = cur.fetchone()
    if row:
        print(f'User {row[0]}: {row[1]} people recs, {row[2]} event recs')
    cur.close()
    
    conn.close()

if __name__ == '__main__':
    main()
