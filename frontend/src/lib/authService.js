/**
 * Authentication Service
 * Handles login/logout and token management for backend API integration
 */

import api, { setAuthToken, removeAuthToken } from './api';

export class AuthService {
  /**
   * Login with backend API
   * @param {string} username 
   * @param {string} password 
   * @param {string} role 
   * @returns {Promise} User data and token
   */
  static async login(username, password, role) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        role
      });

      if (response.token) {
        setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout and clear session
   */
  static async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      removeAuthToken();
    }
  }

  /**
   * Verify current token
   * @returns {Promise} User data if token is valid
   */
  static async verifyToken() {
    try {
      const response = await api.post('/auth/verify');
      return response;
    } catch (error) {
      // Token invalid, remove it
      removeAuthToken();
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  static async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {object} profileData 
   * @returns {Promise} Updated profile data
   */
  static async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Get user statistics (role-specific)
   * @returns {Promise} User statistics
   */
  static async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }
}

export default AuthService;
