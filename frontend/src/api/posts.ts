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
  id: string;
  author_id: string;
  content: string;
  is_event: boolean;
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

export interface PostEvent {
  postid: number;
  user_id: number;
  location_str: string | null;
  post_content: string;
  is_event: boolean;
  time_posted: string | null;
  rsvps: number[];
  capacity: number | null;
  start_time: string | null;
  end_time: string | null;
  author_name: string;
  author_location: string | null;
}

/**
 * rsvp to a post/event
 */
export async function rsvpToPost(postId: number, userId: number): Promise<{ post_id: number; rsvps: number[] }> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/rsvp?user_id=${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to RSVP: ${response.statusText}`);
  }

  return response.json();
}

/**
 * cancel rsvp to a post/event
 */
export async function cancelRsvp(postId: number, userId: number): Promise<{ post_id: number; rsvps: number[] }> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/rsvp?user_id=${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to cancel RSVP: ${response.statusText}`);
  }

  return response.json();
}

/**
 * get posts user is hosting (created by user)
 */
export async function fetchHostedPosts(userId: number): Promise<PostEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/user/${userId}/hosted`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch hosted posts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * get posts user has rsvp'd to
 */
export async function fetchAttendingPosts(userId: number): Promise<PostEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/user/${userId}/attending`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch attending posts: ${response.statusText}`);
  }

  return response.json();
}
