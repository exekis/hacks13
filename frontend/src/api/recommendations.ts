/**
 * recommendations api client
 * 
 * thin wrapper around the backend recommendations endpoints
 * designed to be easily swappable between mock data and real api
 */

// api base url - change this when deploying to production
const API_BASE_URL = 'http://localhost:8000';

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
 */
export async function fetchPeopleRecommendations(
  userId: string,
  limit: number = 20,
  debug: boolean = false
): Promise<PersonRecommendation[]> {
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
 */
export async function fetchPostRecommendations(
  userId: string,
  limit: number = 30,
  debug: boolean = false
): Promise<PostRecommendation[]> {
  const params = new URLSearchParams({
    user_id: userId,
    limit: limit.toString(),
  });
  
  if (debug) {
    params.append('debug', 'true');
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/recommendations/posts?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post recommendations: ${response.statusText}`);
  }
  
  return response.json();
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
 * convert api person recommendation to mock user format
 * for compatibility with existing ui components
 */
export function personRecommendationToMockUser(rec: PersonRecommendation) {
  // extract goals, languages, and cultural backgrounds from tags
  // this is a rough heuristic since the api combines them
  const goals: string[] = [];
  const languages: string[] = [];
  const culturalBackground: string[] = [];
  
  // known goal keywords
  const goalKeywords = ['Friends', 'Food buddies', 'Exploring the city', 'Study pals', 'Gym', 'Events', 'Roommates'];
  
  for (const tag of rec.tags) {
    if (goalKeywords.includes(tag)) {
      goals.push(tag);
    } else if (tag.includes('Asian') || tag.includes('African') || tag.includes('Latin') || tag.includes('European') || tag.includes('Middle') || tag.includes('Indian') || tag.includes('British') || tag.includes('Brazilian') || tag.includes('Mexican') || tag.includes('Nigerian') || tag.includes('Korean') || tag.includes('Japanese') || tag.includes('Vietnamese') || tag.includes('Pakistani') || tag.includes('Arab') || tag.includes('Taiwanese') || tag.includes('Senegalese')) {
      culturalBackground.push(tag);
    } else {
      languages.push(tag);
    }
  }
  
  return {
    id: rec.id,
    name: rec.display_name,
    avatar: 'user',
    bio: rec.bio,
    culturalBackground,
    languages,
    goals,
    verified: {
      student: rec.verified_student,
      age: rec.age_verified,
    },
    location: rec.location_hidden ? 'Location hidden' : '',
    mutualFriends: rec.mutual_friends_count,
    badges: [],
    photos: [],
  };
}

/**
 * convert api post recommendation to mock post format
 * for compatibility with existing ui components
 */
export function postRecommendationToMockPost(rec: PostRecommendation) {
  let dateRange: { from: string; to: string } | undefined;
  
  if (rec.date_range?.start_date) {
    const startDate = new Date(rec.date_range.start_date);
    const endDate = rec.date_range.end_date ? new Date(rec.date_range.end_date) : startDate;
    
    dateRange = {
      from: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      to: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }
  
  return {
    id: rec.id,
    userId: rec.author_id,
    content: rec.text,
    image: rec.image_url || undefined,
    dateRange,
    location: rec.coarse_location,
    timestamp: 'Recently',
  };
}
