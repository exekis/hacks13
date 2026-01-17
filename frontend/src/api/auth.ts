import { UserProfile } from "@/app/types/profile";

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8000" : "/api");

/**
 * Signs up a new user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves to an object containing the access token and token type.
 */
export const signup = async (email: string, password: string): Promise<{ access_token: string; token_type: string; }> => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Signup failed');
  }

  return response.json();
};

/**
 * Logs in a user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves to an object containing the access token and token type.
 */
export const login = async (email: string, password: string): Promise<{ access_token: string; token_type: string; }> => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

/**
 * Fetches the current user's profile.
 * @param token The user's access token.
 * @returns A promise that resolves to the user's profile.
 */
export const getMyProfile = async (token: string): Promise<UserProfile> => {
    const response = await fetch(`${API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }
    return response.json();
}
