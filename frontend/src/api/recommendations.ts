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
  capacity?: number;
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
  
  // generate avatar url based on userid - use randomuser.me with a consistent portrait
  // use modulo to get a portrait number between 1-99
  const portraitNum = (rec.userid % 99) + 1;
  // alternate between men and women based on userid
  const gender = rec.userid % 2 === 0 ? 'women' : 'men';
  const avatarUrl = `https://randomuser.me/api/portraits/${gender}/${portraitNum}.jpg`;
  
  return {
    id: rec.userid.toString(),
    name: displayName,
    avatar: avatarUrl,
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

// category keywords for post image matching
const POST_CATEGORIES = {
  food: ['food', 'eat', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'brunch', 'ramen', 'sushi', 'pizza', 'bubble tea', 'boba', 'cooking', 'kitchen', 'recipe', 'snack', 'dessert', 'bakery'],
  study: ['study', 'library', 'homework', 'exam', 'class', 'lecture', 'assignment', 'project', 'research', 'book', 'reading', 'notes', 'tutor', 'academic'],
  explore: ['explore', 'adventure', 'travel', 'trip', 'visit', 'tour', 'sightseeing', 'downtown', 'neighborhood', 'walk', 'discover', 'new places', 'hidden gem'],
  social: ['hangout', 'chill', 'meet', 'friends', 'party', 'game night', 'movie', 'chat', 'connect', 'social', 'gathering', 'event', 'club'],
  sports: ['gym', 'workout', 'fitness', 'run', 'hike', 'bike', 'swim', 'basketball', 'soccer', 'tennis', 'yoga', 'sports', 'exercise', 'cricket'],
  music: ['music', 'concert', 'live', 'band', 'dance', 'salsa', 'karaoke', 'singing', 'guitar', 'piano', 'dj'],
  art: ['art', 'museum', 'gallery', 'painting', 'exhibition', 'creative', 'photography', 'design'],
  nature: ['park', 'beach', 'lake', 'mountain', 'hiking', 'camping', 'outdoor', 'nature', 'garden', 'sunset', 'sunrise'],
};

// curated unsplash photo ids for each category (more reliable than random)
const CATEGORY_IMAGES: Record<string, string[]> = {
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=400&fit=crop',
  ],
  study: [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
  ],
  explore: [
    'https://images.unsplash.com/photo-1499591934245-40b55745b905?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=400&fit=crop',
  ],
  social: [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=400&fit=crop',
  ],
  sports: [
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461896836934- voices-from-beyond?w=800&h=400&fit=crop',
  ],
  music: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=400&fit=crop',
  ],
  art: [
    'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop',
  ],
  nature: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
  ],
};

// detect category from post content
function detectPostCategory(content: string): string {
  const lowerContent = content.toLowerCase();
  
  for (const [category, keywords] of Object.entries(POST_CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'default';
}

// get an image url for a post based on its content and id
function getPostImageUrl(postId: number, content: string): string | undefined {
  // only ~60% of posts should have images
  if (postId % 10 >= 6) {
    return undefined;
  }
  
  const category = detectPostCategory(content);
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;
  
  // use post id to pick a consistent image
  const imageIndex = postId % images.length;
  return images[imageIndex];
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
    authorName: rec.author_name || 'Traveler',
    authorLocation: rec.author_location || undefined,
    // generate avatar url based on author_id
    authorAvatar: rec.author_id 
      ? `https://randomuser.me/api/portraits/${rec.author_id % 2 === 0 ? 'women' : 'men'}/${(rec.author_id % 99) + 1}.jpg`
      : undefined,
    
    content: rec.post_content,
    // generate category-based image for ~60% of posts
    image: getPostImageUrl(rec.postid, rec.post_content),
    dateRange: { from: '', to: '' },
    timeRange: { from: '', to: '' },
    capacity: rec.capacity || 0,
    location: 'Location revealed after connection',
    timestamp,
  };
}
