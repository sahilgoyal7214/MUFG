'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useUsers, useMembers, useAnalytics, useChatbot } from '../../hooks/useApi';
import apiService from '../../lib/apiService';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

function ChatbotAssistant({ isDark }) {
  const { messages, sendMessage, loading } = useChatbot();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
      <div
        style={{
          display: open ? 'block' : 'none',
          width: 320,
          background: isDark ? '#1f2937' : '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          padding: 16,
          color: isDark ? '#f3f4f6' : '#111827',
          border: isDark ? '1px solid #374151' : 'none'
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, color: isDark ? '#f3f4f6' : '#111827' }}>AI Assistant</div>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.from === 'bot' ? 'left' : 'right', marginBottom: 4 }}>
              <span style={{
                background: msg.from === 'bot'
                  ? (isDark ? '#374151' : '#f3f4f6')
                  : (isDark ? '#047857' : '#d1fae5'),
                color: msg.from === 'bot'
                  ? (isDark ? '#f3f4f6' : '#111827')
                  : (isDark ? '#fff' : '#047857'),
                padding: '6px 12px',
                borderRadius: 8,
                display: 'inline-block',
                fontWeight: msg.from === 'bot' ? 500 : 400
              }}>{msg.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about portfolios..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
              borderRadius: 8,
              background: isDark ? '#374151' : '#fff',
              color: isDark ? '#f3f4f6' : '#111827',
              fontSize: 14
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: '8px 12px',
              background: '#047857',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56,
          height: 56,
          background: '#047857',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}

export default function AdvisorContent({ activeTab, isDark }) {
  // API data hooks
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { members, loading: membersLoading, error: membersError } = useMembers();
  const { analytics, loading: analyticsLoading, error: analyticsError } = useAnalytics();
  
  // Local state
  const [clients, setClients] = useState([]);
  const [advisorStats, setAdvisorStats] = useState({
    totalClients: 0,
    assetsUnderManagement: 0,
    avgPerformance: 0,
    clientsNeedingReview: 0
  });
  
  // Enhanced chart states (similar to member dashboard)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCharts, setGridCharts] = useState([{ id: 1, isConfigured: false }]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [editingChartId, setEditingChartId] = useState(null);
  const [tempConfig, setTempConfig] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Generate enhanced mock pension data
  const generateMockPensionData = () => {
    const data = [];
    const genders = ['Male', 'Female'];
    const countries = ['UK', 'US', 'Canada', 'Australia'];
    
    for (let i = 1; i <= 100; i++) { // More data for advisor dashboard
      const age = Math.floor(Math.random() * 40) + 25; // Age 25-65
      const annualIncome = Math.floor(Math.random() * 80000) + 30000; // £30k-£110k
      const contributionRate = (Math.random() * 10 + 5); // 5-15%
      const contributionAmount = annualIncome * (contributionRate / 100);
      const yearsContributed = Math.floor(Math.random() * 20) + 1;
      const annualReturnRate = Math.random() * 8 + 3; // 3-11%
      const retirementAge = 65;
      const yearsToRetirement = retirementAge - age;
      
      // Calculate projected pension amount
      const projectedPensionAmount = contributionAmount * yearsToRetirement * (1 + annualReturnRate/100);
      
      // Calculate expected annual payout (4% withdrawal rule)
      const expectedAnnualPayout = projectedPensionAmount * 0.04;
      
      // Calculate expected amount payout (total over retirement)
      const expectedLifespanAfterRetirement = 20; // Assume 20 years in retirement
      const expectedAmountPayout = expectedAnnualPayout * expectedLifespanAfterRetirement;
      
      data.push({
        user_id: i,
        age,
        gender: genders[Math.floor(Math.random() * genders.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        annual_income: annualIncome,
        current_savings: Math.floor(Math.random() * 50000) + 5000,
        contribution_amount: Math.round(contributionAmount),
        projected_pension_amount: Math.round(projectedPensionAmount),
        years_contributed: yearsContributed,
        annual_return_rate: Math.round(annualReturnRate * 100) / 100,
        retirement_age_goal: retirementAge,
        employer_contribution: Math.round(contributionAmount * 0.5), // 50% match
        total_annual_contribution: Math.round(contributionAmount * 1.5),
        expected_annual_payout: Math.round(expectedAnnualPayout),
        expected_amount_payout: Math.round(expectedAmountPayout)
      });
    }
    
    return data;
  };

  // Variable names mapping for chart display
  const variableNames = {
    age: 'Age',
    annual_income: 'Annual Income',
    current_savings: 'Current Savings', 
    contribution_amount: 'Contribution Amount',
    projected_pension_amount: 'Projected Pension Amount',
    years_contributed: 'Years Contributed',
    annual_return_rate: 'Annual Return Rate (%)',
    retirement_age_goal: 'Retirement Age Goal',
    employer_contribution: 'Employer Contribution',
    total_annual_contribution: 'Total Annual Contribution',
    expected_annual_payout: 'Expected Annual Payout',
    expected_amount_payout: 'Expected Total Payout'
  };

  // Chart preference management
  const loadChartPreferences = () => {
    try {
      const saved = localStorage.getItem('advisorChartPreferences');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load chart preferences:', error);
      return null;
    }
  };

  const saveChartPreferences = (charts) => {
    try {
      localStorage.setItem('advisorChartPreferences', JSON.stringify(charts));
    } catch (error) {
      console.error('Failed to save chart preferences:', error);
    }
  };

  // Load advisor-specific data
  useEffect(() => {
    const loadAdvisorData = async () => {
      try {
        setLoading(true);
        
        // Load KPIs
        const kpiResponse = await apiService.getAdvisorKPIs();
        if (kpiResponse?.data) {
          setAdvisorStats(kpiResponse.data);
        }

        // Load client portfolio
        const clientsResponse = await apiService.getClientPortfolio();
        if (clientsResponse?.data) {
          setClients(clientsResponse.data);
        }

        // Generate enhanced mock data for charts
        setTimeout(() => {
          const mockData = generateMockPensionData();
          setData(mockData);
          setLoading(false);
        }, 1000); // Simulate data loading
        
      } catch (error) {
        console.error('Failed to load advisor data:', error);
        // Fallback to demo data if API fails
        loadDemoData();
        
        // Still generate mock data for charts
        setTimeout(() => {
          const mockData = generateMockPensionData();
          setData(mockData);
          setLoading(false);
        }, 1000);
      }
    };

    const loadDemoData = () => {
      fetch('/dummy_clients.csv')
        .then(res => res.text())
        .then(text => setClients(parseCSV(text)))
        .catch(err => console.error('Failed to load demo data:', err));
    };

    loadAdvisorData();
  }, []);

  // Parse CSV function
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return {
        ...obj,
        Initials: (obj.Name || `User${index + 1}`)[0].toUpperCase(),
        InitialsColor: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'][index % 5],
        InitialsText: 'text-white'
      };
    });
  };

  // Update stats when users data is loaded
  useEffect(() => {
    if (users.length > 0) {
      setAdvisorStats(prev => ({
        ...prev,
        totalClients: users.length,
        assetsUnderManagement: users.length * 183000, // Demo calculation
        avgPerformance: 7.8,
        clientsNeedingReview: Math.floor(users.length * 0.15)
      }));
    }
  }, [users]);

  // Enhanced Analytics Tab with Charts
  const renderEnhancedAnalyticsTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Portfolio Analytics</h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Advanced insights across your client portfolio</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Clients',
              value: data.length > 0 ? data.length : 'Loading...',
              change: '+12 this month',
              changeType: 'positive',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              )
            },
            {
              title: 'Assets Under Management',
              value: data.length > 0 ? `$${(data.length * 183000 / 1000000).toFixed(1)}M` : 'Loading...',
              change: '+8.3% YTD',
              changeType: 'positive',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              )
            },
            {
              title: 'Avg Portfolio Performance',
              value: data.length > 0 ? `${(data.reduce((sum, client) => sum + client.annual_return_rate, 0) / data.length).toFixed(1)}%` : 'Loading...',
              change: 'Above benchmark',
              changeType: 'positive',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            {
              title: 'Clients Needing Review',
              value: data.length > 0 ? Math.floor(data.length * 0.15) : 'Loading...',
              change: 'Action required',
              changeType: 'negative',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )
            }
          ].map((kpi, index) => (
            <div key={index} className={`rounded-2xl shadow-xl border transition-all duration-300 backdrop-blur-sm p-6 ${isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-100'
              }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'
                  }`}>
                  <div className={`${isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                    {kpi.icon}
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-full ${kpi.changeType === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : kpi.changeType === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  <span>{kpi.change}</span>
                </div>
              </div>
              <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{kpi.title}</h3>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {loading ? (
          <div className={`rounded-2xl shadow-xl border p-8 text-center transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Loading portfolio data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Age Distribution Chart */}
              <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Client Age Distribution</h3>
                <div className="h-64">
                  <Plot
                    data={[{
                      x: data.map(d => d.age),
                      type: 'histogram',
                      marker: { color: '#3B82F6', opacity: 0.8 },
                      name: 'Age Distribution'
                    }]}
                    layout={{
                      autosize: true,
                      margin: { l: 40, r: 40, t: 40, b: 40 },
                      paper_bgcolor: isDark ? '#1F2937' : '#FFFFFF',
                      plot_bgcolor: isDark ? '#374151' : '#F9FAFB',
                      font: { color: isDark ? '#F3F4F6' : '#111827' },
                      xaxis: { title: 'Age', gridcolor: isDark ? '#4B5563' : '#E5E7EB' },
                      yaxis: { title: 'Count', gridcolor: isDark ? '#4B5563' : '#E5E7EB' }
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Income vs Savings Scatter */}
              <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Income vs Current Savings</h3>
                <div className="h-64">
                  <Plot
                    data={[{
                      x: data.map(d => d.annual_income),
                      y: data.map(d => d.current_savings),
                      mode: 'markers',
                      type: 'scatter',
                      marker: { 
                        color: '#8B5CF6', 
                        size: 8,
                        opacity: 0.7
                      },
                      name: 'Clients'
                    }]}
                    layout={{
                      autosize: true,
                      margin: { l: 40, r: 40, t: 40, b: 40 },
                      paper_bgcolor: isDark ? '#1F2937' : '#FFFFFF',
                      plot_bgcolor: isDark ? '#374151' : '#F9FAFB',
                      font: { color: isDark ? '#F3F4F6' : '#111827' },
                      xaxis: { title: 'Annual Income', gridcolor: isDark ? '#4B5563' : '#E5E7EB' },
                      yaxis: { title: 'Current Savings', gridcolor: isDark ? '#4B5563' : '#E5E7EB' }
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Performance Chart */}
            <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Projected Pension by Age</h3>
              <div className="h-80">
                <Plot
                  data={[{
                    x: data.map(d => d.age),
                    y: data.map(d => d.projected_pension_amount),
                    mode: 'markers',
                    type: 'scatter',
                    marker: { 
                      color: data.map(d => d.annual_return_rate),
                      colorscale: 'Viridis',
                      size: 10,
                      opacity: 0.8,
                      colorbar: {
                        title: 'Return Rate (%)',
                        titlefont: { color: isDark ? '#F3F4F6' : '#111827' },
                        tickfont: { color: isDark ? '#F3F4F6' : '#111827' }
                      }
                    },
                    name: 'Projected Pension'
                  }]}
                  layout={{
                    autosize: true,
                    margin: { l: 60, r: 60, t: 40, b: 60 },
                    paper_bgcolor: isDark ? '#1F2937' : '#FFFFFF',
                    plot_bgcolor: isDark ? '#374151' : '#F9FAFB',
                    font: { color: isDark ? '#F3F4F6' : '#111827' },
                    xaxis: { title: 'Client Age', gridcolor: isDark ? '#4B5563' : '#E5E7EB' },
                    yaxis: { title: 'Projected Pension Amount', gridcolor: isDark ? '#4B5563' : '#E5E7EB' }
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Simple Portfolio Tab (existing functionality)
  const renderPortfolioTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Client Portfolio Management</h2>
          <div className={`border rounded-lg px-3 py-2 text-sm transition-colors duration-300 ${
            isDark ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}>
            <span className="font-medium">Authorization Mode: Prototype</span>
            <span className="ml-2">• Showing all users</span>
          </div>
        </div>

        {/* Loading States */}
        {(usersLoading || membersLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className={`ml-3 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Loading portfolio data...</span>
          </div>
        )}

        {/* Error States */}
        {(usersError || membersError) && (
          <div className={`border rounded-lg p-4 mb-6 transition-colors duration-300 ${
            isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`transition-colors duration-300 ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>Error loading data: {usersError || membersError}</p>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              isDark ? 'text-red-400' : 'text-red-500'
            }`}>Falling back to demo data...</p>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Clients</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{advisorStats.totalClients || users.length}</p>
            <p className="text-sm text-green-600">
              {users.length > 0 ? `API Connected • ${users.length} users` : '+12 this month'}
            </p>
          </div>
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Assets Under Management</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              ${((advisorStats.assetsUnderManagement || 45200000) / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-green-600">+8.3% YTD</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Avg Portfolio Performance</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>7.8%</p>
            <p className="text-sm text-green-600">Above benchmark</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Clients Needing Review</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>18</p>
            <p className="text-sm text-orange-600">Action required</p>
          </div>
        </div>

        {/* Client List */}
        <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Client Overview</h3>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search clients..." 
                className={`border rounded-lg px-3 py-2 text-sm transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`} 
              />
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Add Client
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>User ID</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>Client</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>Annual Income</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>Current Savings</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>Risk Tolerance</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>Retirement Age Goal</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-300 ${
                    isDark ? 'text-gray-200' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {(clients.length > 0 ? clients.slice(0, 10) : users.slice(0, 10)).map((client, index) => {
                  const isUser = !client.User_ID; // If no User_ID, it's from users API
                  const displayData = isUser ? {
                    User_ID: client.id || index + 1,
                    Name: client.username || client.email?.split('@')[0] || 'User',
                    Age: Math.floor(Math.random() * 30) + 25, // Demo age
                    Annual_Income: '$' + (Math.floor(Math.random() * 100000) + 50000).toLocaleString(),
                    Current_Savings: '$' + (Math.floor(Math.random() * 500000) + 10000).toLocaleString(),
                    Risk_Tolerance: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                    Retirement_Age_Goal: Math.floor(Math.random() * 10) + 60,
                    Initials: (client.username || client.email || 'U')[0].toUpperCase(),
                    InitialsColor: 'bg-blue-500',
                    InitialsText: 'text-white'
                  } : client;
                  
                  return (
                    <tr key={displayData.User_ID} className={`transition-colors duration-300 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>{displayData.User_ID}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${displayData.InitialsColor} rounded-full flex items-center justify-center`}>
                            <span className={`${displayData.InitialsText} font-medium text-sm`}>{displayData.Initials}</span>
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium transition-colors duration-300 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{displayData.Name}</p>
                            <p className={`text-sm transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>Age {displayData.Age}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>{displayData.Annual_Income}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>{displayData.Current_Savings}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          displayData.Risk_Tolerance === 'Low' ? 'bg-green-100 text-green-800' :
                          displayData.Risk_Tolerance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {displayData.Risk_Tolerance}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>{displayData.Retirement_Age_Goal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Main content router
  const renderContent = () => {
    switch (activeTab) {
      case 'advisorPortfolio':
        return renderPortfolioTab();
      case 'advisorAnalytics':
        return renderEnhancedAnalyticsTab();
      default:
        return renderPortfolioTab();
    }
  };

  return (
    <>
      {renderContent()}
      <ChatbotAssistant isDark={isDark} />
    </>
  );
}
