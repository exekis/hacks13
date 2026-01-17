"""
generate all recommendations for users

this script detects whether pgvector is available and runs the appropriate
recommendation generation:
- with pgvector: uses embedding-based similarity
- without pgvector: uses random recommendations

run: DB_USER=$(whoami) DB_NAME=hacks13 python backend/db/generate_all_recs.py
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

DB_NAME = os.getenv('DB_NAME', 'hacks13')
DB_USER = os.getenv('DB_USER', 'jennifer')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')


def get_conn():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


def check_vector_available(conn) -> bool:
    """check if pgvector extension is enabled"""
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector'")
    result = cur.fetchone()[0] > 0
    cur.close()
    return result


def check_embeddings_exist(conn) -> bool:
    """check if any embeddings have been generated"""
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM users WHERE user_embedding IS NOT NULL")
        users_with_emb = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM posts WHERE post_embedding IS NOT NULL")
        posts_with_emb = cur.fetchone()[0]
        cur.close()
        return users_with_emb > 0 or posts_with_emb > 0
    except psycopg2.errors.UndefinedColumn:
        conn.rollback()
        return False


def generate_vector_recs(conn):
    """generate vector-based recommendations using embeddings"""
    print('Generating vector-based recommendations...')
    
    # import the helpers
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))
    from app.services.helpers.store_event_recs_in_db_emb import (
        store_user_avg_embedding,
        store_events_recs_candidates
    )
    from app.services.helpers.store_people_recs_in_db import generate_all_people_recs
    
    # generate user embeddings from posts
    print('Computing user embeddings from posts...')
    store_user_avg_embedding(conn)
    
    # generate event recommendations
    print('Generating event recommendations...')
    store_events_recs_candidates(conn)
    
    # generate people recommendations
    print('Generating people recommendations...')
    generate_all_people_recs(conn)
    
    print('Vector-based recommendations complete')


def generate_random_recs(conn):
    """generate random recommendations when vector not available"""
    import random
    from psycopg2.extras import Json
    
    print('Generating random recommendations...')
    cur = conn.cursor()

    # get all user ids
    cur.execute('SELECT userid FROM users')
    user_ids = [row[0] for row in cur.fetchall()]
    print(f'  Found {len(user_ids)} users')

    # get all posts
    cur.execute('SELECT postid, user_id FROM posts')
    posts = cur.fetchall()
    print(f'  Found {len(posts)} posts')

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
            print(f'  Processed {i + 1}/{len(user_ids)} users')

    print(f'Random recommendations complete for {len(user_ids)} users')
    cur.close()


def verify_recs(conn):
    """verify recommendations were generated"""
    cur = conn.cursor()
    cur.execute('''
        SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE people_recs IS NOT NULL AND jsonb_array_length(people_recs) > 0) as users_with_people_recs,
            COUNT(*) FILTER (WHERE event_recs_emb IS NOT NULL AND array_length(event_recs_emb, 1) > 0) as users_with_event_recs
        FROM users
    ''')
    row = cur.fetchone()
    print(f'\nVerification:')
    print(f'  Total users: {row[0]}')
    print(f'  Users with people recs: {row[1]}')
    print(f'  Users with event recs: {row[2]}')
    cur.close()


def main():
    print(f'Connecting to database {DB_NAME}...')
    conn = get_conn()
    
    vector_available = check_vector_available(conn)
    embeddings_exist = check_embeddings_exist(conn)
    
    print(f'pgvector available: {vector_available}')
    print(f'embeddings exist: {embeddings_exist}')
    
    if vector_available and embeddings_exist:
        # use vector-based recommendations
        try:
            generate_vector_recs(conn)
        except Exception as e:
            print(f'Vector recs failed ({e}), falling back to random')
            generate_random_recs(conn)
    else:
        # fall back to random recommendations
        generate_random_recs(conn)
    
    verify_recs(conn)
    conn.close()
    print('\nDone!')


if __name__ == '__main__':
    main()
