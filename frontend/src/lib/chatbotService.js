/**
 * Chatbot Service
 * Handles AI chatbot interactions with the backend
 */

import api from './api';

export class ChatbotService {
  /**
   * Send message to chatbot
   * @param {string} message - User message
   * @param {string} context - Optional context (role, current data, etc.)
   * @returns {Promise} Chatbot response
   */
  static async sendMessage(message, context = {}) {
    try {
      const response = await api.post('/chatbot/message', {
        message,
        context
      });
      return response;
    } catch (error) {
      console.error('Failed to send chatbot message:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   * @param {number} limit - Number of messages to retrieve
   * @returns {Promise} Chat history
   */
  static async getChatHistory(limit = 50) {
    try {
      const response = await api.get(`/chatbot/history?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  }

  /**
   * Clear chat history
   * @returns {Promise} Success response
   */
  static async clearHistory() {
    try {
      const response = await api.delete('/chatbot/history');
      return response;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw error;
    }
  }

  /**
   * Get chatbot health status
   * @returns {Promise} Health status
   */
  static async getHealth() {
    try {
      const response = await api.get('/chatbot/health');
      return response;
    } catch (error) {
      console.error('Failed to get chatbot health:', error);
      throw error;
    }
  }

  /**
   * Analyze graph/chart with AI
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} prompt - Analysis prompt
   * @returns {Promise} AI analysis
   */
  static async analyzeGraph(imageBase64, prompt = '') {
    try {
      const response = await api.post('/graph-insights/analyze', {
        image: imageBase64,
        prompt: prompt || 'Please analyze this pension data chart and provide insights.'
      });
      return response;
    } catch (error) {
      console.error('Failed to analyze graph:', error);
      throw error;
    }
  }
}

export default ChatbotService;
