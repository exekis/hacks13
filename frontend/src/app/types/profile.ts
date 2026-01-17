export interface UserProfile {
  // Basic Information
  fullName: string;
  age: number;
  pronouns?: string;
  isStudent: boolean;
  university?: string;
  currentCity: string;
  travelingTo?: string;
  languages: string[];
  hometown?: string;
  agePreference: {
    enabled: boolean;
    range: number; // ±2, ±5, ±8 years
  };
  verifiedStudentsOnly: boolean;

  // Cultural Information
  culturalIdentity?: string[];
  ethnicity: string[];
  religion?: string[];
  culturalSimilarityImportance: number; // 0-100
  culturalComfortLevel: 'open' | 'prefer-similar' | 'strong-preference';
  languageMatchImportant: boolean;

  // Travel + Intent
  purposeOfStay: string;
  stayDuration?: {
    from?: string;
    to?: string;
    unsure?: boolean;
  };
  lookingFor: string[]; // goals
  socialVibe: string[];
  availability: string[];

  // Safety + Comfort
  whoCanMessage: 'friends' | 'friends-of-friends' | 'anyone-verified';
  whoCanSeePosts: 'friends' | 'friends-of-friends' | 'everyone-verified';
  hideLocationUntilFriends: boolean;
  meetupPreference: 'public-only' | 'public-first' | 'comfortable-either';
  boundaries?: string;

  // Profile Customization
  bio: string;
  interests: string[];
  badges: string[];

  // Match Filters
  matchFilters: {
    ageRange: [number, number];
    sharedGoals: string[];
    languages: string[];
    verifiedOnly: boolean;
    culturalSimilarity: number; // 0-100
  };
}

export const defaultProfile: Partial<UserProfile> = {
  agePreference: { enabled: true, range: 5 },
  verifiedStudentsOnly: false,
  culturalSimilarityImportance: 50,
  culturalComfortLevel: 'open',
  languageMatchImportant: false,
  hideLocationUntilFriends: true,
  whoCanMessage: 'anyone-verified',
  whoCanSeePosts: 'everyone-verified',
  meetupPreference: 'public-first',
  matchFilters: {
    ageRange: [18, 30],
    sharedGoals: [],
    languages: [],
    verifiedOnly: false,
    culturalSimilarity: 50,
  },
};
