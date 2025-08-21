/**
 * API Configuration and Base Setup
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// Default headers for all API requests
const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Makes HTTP requests to the backend API
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {object} options - Request options
 * @returns {Promise} - Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options,
  };

  // Add JWT token if available (from NextAuth session or localStorage)
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get JWT token from NextAuth session or localStorage
 */
async function getAuthToken() {
  // Try to get token from NextAuth session first
  if (typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if (session?.accessToken) {
        return session.accessToken;
      }
    } catch (error) {
      console.warn('Could not get NextAuth session:', error);
    }
    
    // Fallback to localStorage
    return localStorage.getItem('jwt_token');
  }
  return null;
}

/**
 * Set JWT token in storage
 */
export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
}

/**
 * Remove JWT token from storage
 */
export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
}

// Convenience methods for different HTTP verbs
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...options 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...options 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { method: 'DELETE', ...options }),
};

export default api;
