/**
 * Data Service
 * Handles all data-related API calls to the backend
 */

import api from './api';

export class DataService {
  /**
   * Get pension data for members
   * @param {object} filters - Optional filters
   * @returns {Promise} Pension data array
   */
  static async getPensionData(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/data/pension-data${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get pension data:', error);
      throw error;
    }
  }

  /**
   * Get member-specific data
   * @param {string} memberId - Member ID
   * @returns {Promise} Member data
   */
  static async getMemberData(memberId) {
    try {
      const response = await api.get(`/members/${memberId}`);
      return response;
    } catch (error) {
      console.error('Failed to get member data:', error);
      throw error;
    }
  }

  /**
   * Get all members (for advisors/regulators)
   * @param {object} params - Query parameters
   * @returns {Promise} Members list
   */
  static async getMembers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `/members${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get members:', error);
      throw error;
    }
  }

  /**
   * Get data insights
   * @param {object} params - Analysis parameters
   * @returns {Promise} Insights data
   */
  static async getDataInsights(params = {}) {
    try {
      const response = await api.post('/data/insights', params);
      return response;
    } catch (error) {
      console.error('Failed to get data insights:', error);
      throw error;
    }
  }

  /**
   * Upload data file
   * @param {FormData} formData - File data
   * @returns {Promise} Upload result
   */
  static async uploadData(formData) {
    try {
      const response = await api.post('/data/upload', formData, {
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to upload data:', error);
      throw error;
    }
  }

  /**
   * Get KPI calculations
   * @param {object} params - KPI parameters
   * @returns {Promise} KPI data
   */
  static async getKPIs(params = {}) {
    try {
      const response = await api.post('/kpi/calculate', params);
      return response;
    } catch (error) {
      console.error('Failed to get KPIs:', error);
      throw error;
    }
  }

  /**
   * Get available KPI types
   * @returns {Promise} Available KPI types
   */
  static async getKPITypes() {
    try {
      const response = await api.get('/kpi/types');
      return response;
    } catch (error) {
      console.error('Failed to get KPI types:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   * @param {object} params - Analytics parameters
   * @returns {Promise} Analytics data
   */
  static async getAnalytics(params = {}) {
    try {
      const response = await api.post('/analytics/generate', params);
      return response;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }
}

export default DataService;
