/**
 * API Service for MUFG Pension Insights Platform
 * Handles all backend API calls through frontend proxy endpoints
 */

class ApiService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.proxyPrefix = '/api/proxy';
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${this.proxyPrefix}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for NextAuth
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Users API
  async getUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Members API
  async getMembers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/members${queryString ? `?${queryString}` : ''}`);
  }

  async getMemberById(id) {
    return this.request(`/members/${id}`);
  }

  async getMemberPensionData(id) {
    return this.request(`/members/${id}/pension-data`);
  }

  // Analytics API
  async getAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getPerformanceMetrics() {
    return this.request('/analytics/performance');
  }

  async getPortfolioAnalysis(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/portfolio${queryString ? `?${queryString}` : ''}`);
  }

  async getRiskAssessment() {
    return this.request('/analytics/risk');
  }

  // Chatbot API
  async sendChatMessage(message, context = {}) {
    return this.request('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getChatHistory() {
    return this.request('/chatbot/history');
  }

  // KPI API
  async getKPIs() {
    return this.request('/kpi');
  }

  async getAdvisorKPIs() {
    return this.request('/kpi/advisor');
  }

  async getRegulatorKPIs() {
    return this.request('/kpi/regulator');
  }

  // Advisor API
  async getAdvisorDashboard() {
    return this.request('/advisor/dashboard');
  }

  async getClientPortfolio() {
    return this.request('/advisor/clients');
  }

  async getAdvisorReports() {
    return this.request('/advisor/reports');
  }

  // Pension Data API
  async getPensionData(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/pension-data${queryString ? `?${queryString}` : ''}`);
  }

  async uploadPensionData(formData) {
    return this.request('/pension-data/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - let browser set it
      },
    });
  }

  // Graph Insights API
  async getGraphInsights(graphData) {
    return this.request('/graph-insights', {
      method: 'POST',
      body: JSON.stringify(graphData),
    });
  }

  async analyzeChart(chartConfig) {
    return this.request('/graph-insights/analyze', {
      method: 'POST',
      body: JSON.stringify(chartConfig),
    });
  }

  // Utility methods for role-specific data
  async getDashboardData(role) {
    switch (role) {
      case 'member':
        return Promise.all([
          this.getAnalytics(),
          this.getPensionData({ limit: 10 }),
        ]).then(([analytics, pensionData]) => ({
          analytics,
          pensionData,
        }));

      case 'advisor':
        return Promise.all([
          this.getAdvisorDashboard(),
          this.getClientPortfolio(),
          this.getAdvisorKPIs(),
          this.getUsers(),
        ]).then(([dashboard, clients, kpis, users]) => ({
          dashboard,
          clients,
          kpis,
          users,
        }));

      case 'regulator':
        return Promise.all([
          this.getRegulatorKPIs(),
          this.getAnalytics(),
          this.getUsers(),
          this.getMembers(),
        ]).then(([kpis, analytics, users, members]) => ({
          kpis,
          analytics,
          users,
          members,
        }));

      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
