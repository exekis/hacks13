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
