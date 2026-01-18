/**
 * posts api client
 */

const API_BASE_URL = 'http://localhost:8000';

export interface CreatePostRequest {
  author_id: number;
  content: string;
  is_event: boolean;
}

export interface PostResponse {
  content: any;
  author_id: any;
  id: string;
  user_id: string;
  post_content: string;
  capacity: number;
  start_time: string;
  end_time: string;
  location_str: string;
  is_event: boolean;
  time_posted: string;
  author_name?: string;
  author_location?: string;
  author_avatar?: string;
}

/**
 * create a new post
 */
export async function createPost(data: CreatePostRequest): Promise<PostResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/post/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create post');
  }

  return response.json();
}

/**
 * fetch posts for a specific user
 */
export async function fetchUserPosts(userId: string): Promise<PostResponse[]> {
  const response = await fetch(`${API_BASE_URL}/profile/posts/${userId}`);
  
  if (!response.ok) {
    // return empty array if endpoint doesn't exist or fails
    return [];
  }
  return response.json();
}

/**
 * RSVP to a post
 */
export async function rsvpToPost(postId: string, userId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to RSVP to post');
  }
}

/**
 * fetch posts a user has RSVPd to
 */
export async function fetchRsvpdPosts(userId: string): Promise<PostResponse[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/rsvps`);
  
  if (!response.ok) {
    // return empty array if endpoint doesn't exist or fails
    return [];
  }

  return response.json();
}
