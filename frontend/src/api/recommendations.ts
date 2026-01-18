/**
 * recommendations api client
 * 
 * thin wrapper around the backend recommendations endpoints
 * designed to be easily swappable between mock data and real api
 */

// api base url - change this when deploying to production
const API_BASE_URL = 'http://localhost:8000';

// backend response types (matches what the backend actually returns)
export interface BackendPersonRecommendation {
  userid: number;
  name: string;
  pronouns: string | null;
  currentCity: string | null;
  travelingTo: string | null;
  age: number | null;
  bio: string | null;
  languages: string[];
  lookingFor: string[];
  culturalIdentity: string[];
  isStudent: boolean | null;
  university: string | null;
}

export interface BackendPostRecommendation {
  postid: number;
  time_posted: string | null;
  post_content: string;
  author_id: number | null;
  author_name: string | null;
  author_location: string | null;
}

// frontend-compatible types (for ui components)
export interface PersonRecommendation {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  verified_student: boolean;
  age_verified: boolean;
  tags: string[];
  mutual_friends_count: number;
  location_hidden: boolean;
  debug_score?: number;
}

export interface PostRecommendation {
  id: string;
  author_id: string;
  author_name: string;
  author_verified_student: boolean;
  text: string;
  image_url: string | null;
  coarse_location: string;
  date_range: { start_date: string | null; end_date: string | null } | null;
  liked_by_friends_count: number;
  debug_score?: number;
}

/**
 * fetch people recommendations from the api
 * returns raw backend data that can be transformed for ui use
 */
export async function fetchPeopleRecommendations(
  userId: string,
  limit: number = 20,
  debug: boolean = false
): Promise<BackendPersonRecommendation[]> {
  const params = new URLSearchParams({
    user_id: userId,
    limit: limit.toString(),
  });
  
  if (debug) {
    params.append('debug', 'true');
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/recommendations/people?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch people recommendations: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * fetch post recommendations from the api
 * returns raw backend data that can be transformed for ui use
 */
export async function fetchPostRecommendations(
  userId: string,
  limit: number = 30,
  debug: boolean = false
): Promise<BackendPostRecommendation[]> {
  const params = new URLSearchParams({
    user_id: userId,
    limit: limit.toString(),
  });
  
  if (debug) {
    params.append('debug', 'true');
  }
  
  console.log('[recommendations] fetching posts from:', `${API_BASE_URL}/api/recommendations/posts?${params}`);
  
  const response = await fetch(
    `${API_BASE_URL}/api/recommendations/posts?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post recommendations: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('[recommendations] posts response:', data.length, 'items');
  return data;
}

/**
 * check if the api is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

/**
 * convert backend person recommendation to mock user format
 * for compatibility with existing ui components
 */
export function backendPersonToMockUser(rec: BackendPersonRecommendation) {
  // use the actual name from the backend
  const displayName = rec.name || `User ${rec.userid}`;
  
  // extract location info
  const location = rec.currentCity || 'Location hidden';
  
  // build goals from lookingFor array
  const goals = rec.lookingFor.length > 0 
    ? rec.lookingFor 
    : (rec.travelingTo ? [`Traveling to ${rec.travelingTo}`] : ['Exploring']);
  
  // build badges
  const badges: string[] = [];
  if (rec.isStudent) badges.push('Verified Student');
  if (rec.university) badges.push(rec.university);
  
  return {
    id: rec.userid.toString(),
    name: displayName,
    avatar: 'user',
    bio: rec.bio || 'No bio available',
    culturalBackground: rec.culturalIdentity || [],
    languages: rec.languages || [],
    goals,
    pronouns: rec.pronouns || undefined,
    verified: {
      student: rec.isStudent ?? false,
      age: true,
    },
    location,
    mutualFriends: 0,
    badges,
    photos: [] as string[],
    age: rec.age || undefined,
    travelingTo: rec.travelingTo || undefined,
    university: rec.university || undefined,
  };
}

/**
 * convert backend post recommendation to mock post format
 * for compatibility with existing ui components
 */
export function backendPostToMockPost(rec: BackendPostRecommendation) {
  // format timestamp
  let timestamp = 'Recently';
  if (rec.time_posted) {
    const postedDate = new Date(rec.time_posted);
    const now = new Date();
    const diffMs = now.getTime() - postedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      timestamp = 'Just now';
    } else if (diffHours < 24) {
      timestamp = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      timestamp = `${diffDays}d ago`;
    } else {
      timestamp = postedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
  
  return {
    id: rec.postid.toString(),
    
    // author information from backend
    userId: rec.author_id?.toString() || '0',
    authorName: rec.author_name || `User ${rec.author_id}`,
    authorLocation: rec.author_location || undefined,
    
    content: rec.post_content,
    image: undefined,
    dateRange: undefined,
    location: 'Location revealed after connection',
    timestamp,
  };
}
