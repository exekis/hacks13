/**
 * Profile Setup API
 * Handles progressive profile building during onboarding
 */

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8000" : "/api");

interface Step1Data {
  fullName: string;
  age: number;
  pronouns?: string;
  isStudent: boolean;
  university?: string;
  currentCity: string;
  languages: string[];
  hometown?: string;
}

interface Step2Data {
  culturalIdentity: string[];
  ethnicity?: string[];
  religion?: string[];
  culturalSimilarityImportance: number;
  culturalComfortLevel: string;
  languageMatchImportant: boolean;
}

interface Step3Data {
  lookingFor: string[];
  socialVibe: string[];
  availability?: string[];
  purposeOfStay?: string;
}

interface Step4Data {

  whoCanSeePosts: string;
  hideLocationUntilFriends: boolean;
  meetupPreference: string;
  boundaries?: string;
}

interface Step5Data {
  bio: string;
  interests: string[];
  badges?: string[];
  AboutMe?: string;
}

interface Step6Data {
  agePreference?: { enabled: boolean; range: number };
  verifiedStudentsOnly: boolean;
  culturalSimilarity: number;
}

/**
 * Save Step 1: Basic Information
 */
export const saveStep1 = async (data: Step1Data, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/setup/step1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save step 1 data');
  }

  return response.json();
};

/**
 * Save Step 2: Cultural Information
 */
export const saveStep2 = async (data: Step2Data, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/setup/step2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save step 2 data');
  }

  return response.json();
};

/**
 * Save Step 3: Travel + Intent
 */
export const saveStep3 = async (data: Step3Data, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/setup/step3`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save step 3 data');
  }

  return response.json();
};

/**
 * Save Step 4: Safety + Comfort
 */
export const saveStep4 = async (data: Step4Data, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/setup/step4`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save step 4 data');
  }

  return response.json();
};

/**
 * Save Step 5: Profile Customization
 */
export const saveStep5 = async (data: Step5Data, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/setup/step5`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save step 5 data');
  }

  return response.json();
};

/**
 * Save Step 6: Match Filters
 */
export const saveStep6 = async (data: Step6Data, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/setup/step6`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save step 6 data');
  }

  return response.json();
};

/**
 * Debug: Get full profile data
 */
export const testGetFullProfile = async (userId: number): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/test/full/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
};

/**
 * Debug: Verify profile completion
 */
export const testVerifyProfileCompletion = async (userId: number): Promise<any> => {
  const response = await fetch(`${API_URL}/profile/test/verify/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to verify profile');
  }

  return response.json();
};
