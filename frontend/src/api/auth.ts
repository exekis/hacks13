/// <reference types="vite/client" />

import { UserProfile } from "@/app/types/profile";

export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8000" : "/api");

/**
 * Signs up a new user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves to an object containing the access token and token type.
 */
export const signup = async (email: string, password: string): Promise<{ access_token: string; token_type: string; user_id: number }> => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Signup failed');
  }

  return response.json();
};

/**
 * Logs in a user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves to an object containing the access token and token type.
 */
export const login = async (email: string, password: string): Promise<{ access_token: string; token_type: string; user_id: number }> => {
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
 * Stores the access token in local storage.
 * @param token The access token to store.
 */
export const storeToken = (token: string) => {
  localStorage.setItem('access_token', token);
};

/**
 * Retrieves the access token from local storage.
 * @returns The access token, or null if it's not found.
 */
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Retrieves the user ID from local storage.
 * @returns The user ID, or null if it's not found.
 */
export const getUserId = (): string | null => {
    return localStorage.getItem('user_id');
};

/**
 * Clears the access token from local storage.
 */
export const clearToken = () => {
  localStorage.removeItem('access_token');
};

/**
  * Fetches the current user's profile.
  * @returns A promise that resolves to the user's profile.
  */
export const getMyProfile = async (): Promise<UserProfile> => {
    const token = getToken();
    if (!token) {
        throw new Error("No access token found");
    }
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
