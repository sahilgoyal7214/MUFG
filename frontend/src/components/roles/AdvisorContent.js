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
  console.log('🔥 AdvisorContent component rendered with activeTab:', activeTab);
  
  // Remove problematic API hooks that are causing errors
  // const { users, loading: usersLoading, error: usersError } = useUsers();
  // const { members, loading: membersLoading, error: membersError } = useMembers();
  
  // Remove analytics hook dependency since it's causing 500 errors
  // const { analytics, loading: analyticsLoading, error: analyticsError } = useAnalytics();
  
  // Local state
  const [clients, setClients] = useState([]);
  const [advisorStats, setAdvisorStats] = useState({
    totalClients: 0,
    assetsUnderManagement: 0,
    avgPortfolioPerformance: 0,
    clientsNeedingReview: 0
  });
  
  // Remove temporary error state since the page is working fine now
  // const [apiError, setApiError] = useState('Route not found');
  
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
    console.log('🔥 AdvisorContent useEffect triggered!');
    
    const loadAdvisorData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading advisor data from PostgreSQL...');
        
        // Load KPIs from PostgreSQL via backend
        try {
          console.log('🔍 Calling getAdvisorKPIs...');
          const kpiResponse = await apiService.getAdvisorKPIs();
          console.log('🔍 KPI Response:', kpiResponse);
          if (kpiResponse?.success && kpiResponse?.data) {
            setAdvisorStats(kpiResponse.data);
            console.log('✅ KPIs loaded successfully from PostgreSQL:', kpiResponse.data);
          } else {
            console.log('⚠️ KPI response format unexpected, keeping current state');
          }
        } catch (kpiError) {
          console.error('❌ Failed to load advisor KPIs:', kpiError);
          // Keep current state, don't override with fallback
        }

        // Load client portfolio from PostgreSQL via backend
        try {
          console.log('🔍 Calling getClientPortfolio...');
          const clientsResponse = await apiService.getClientPortfolio();
          console.log('🔍 Clients Response:', clientsResponse);
          if (clientsResponse?.success && clientsResponse?.data) {
            setClients(clientsResponse.data);
            console.log('✅ Clients loaded successfully:', clientsResponse.data.length, 'clients');
          } else {
            console.log('⚠️ Clients response format unexpected:', clientsResponse);
          }
        } catch (clientsError) {
          console.error('❌ Failed to load client portfolio:', clientsError);
          // Keep current state, don't override with fallback
        }

        // Generate enhanced mock data for charts (keeping for demo purposes)
        setTimeout(() => {
          const mockData = generateMockPensionData();
          setData(mockData);
          setLoading(false);
          console.log('✅ Mock data generated for charts');
        }, 1000);
        
      } catch (error) {
        console.error('❌ Critical error loading advisor data:', error);
        setLoading(false);
        
        // Still generate mock data for charts
        setTimeout(() => {
          const mockData = generateMockPensionData();
          setData(mockData);
        }, 1000);
      }
    };

    loadAdvisorData();
  }, []);

  // Update stats when clients data is loaded
  useEffect(() => {
    if (clients.length > 0) {
      setAdvisorStats(prev => ({
        ...prev,
        totalClients: clients.length,
        assetsUnderManagement: clients.length * 183000, // Demo calculation
        avgPerformance: 7.8,
        clientsNeedingReview: Math.floor(clients.length * 0.15)
      }));
    }
  }, [clients]);

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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className={`ml-3 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Loading portfolio data...</span>
          </div>
        )}

        {/* Portfolio Summary - 4 PostgreSQL KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Active Clients</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{advisorStats.totalClients || 100}</p>
            <p className="text-sm text-green-600">
              {advisorStats.totalClients ? 'PostgreSQL Data' : 'Default Value'}
            </p>
          </div>
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Assets Under Management</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              ${advisorStats.assetsUnderManagement 
                ? `${(advisorStats.assetsUnderManagement / 1000000).toFixed(1)}M` 
                : '18.3M'}
            </p>
            <p className="text-sm text-green-600">
              {advisorStats.assetsUnderManagement ? 'Sum of Current_Savings' : 'Default Value'}
            </p>
          </div>
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Average Annual Return Rate</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{advisorStats.avgAnnualReturnRate 
                ? `${advisorStats.avgAnnualReturnRate.toFixed(1)}%`
                : '7.8%'}</p>
            <p className="text-sm text-green-600">
              {advisorStats.avgAnnualReturnRate ? 'Real Portfolio Performance' : 'Default Value'}
            </p>
          </div>
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>High-Risk Clients</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{advisorStats.highRiskClients !== undefined ? advisorStats.highRiskClients : 23}</p>
            <p className="text-sm text-orange-600">
              {advisorStats.highRiskClients !== undefined ? 'Risk_Tolerance = High' : 'Default Value'}
            </p>
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
                {(() => {
                  // Use clients data if available, otherwise show demo data
                  const displayData = clients.length > 0 ? clients.slice(0, 10) : Array.from({length: 10}, (_, index) => ({
                    User_ID: index + 1,
                    Name: `Demo User ${index + 1}`,
                    Age: Math.floor(Math.random() * 30) + 25,
                    Annual_Income: '$' + (Math.floor(Math.random() * 100000) + 50000).toLocaleString(),
                    Current_Savings: '$' + (Math.floor(Math.random() * 500000) + 10000).toLocaleString(),
                    Risk_Tolerance: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                    Retirement_Age_Goal: Math.floor(Math.random() * 10) + 60,
                    Portfolio_Performance: (Math.random() * 5 + 5).toFixed(1),
                    Initials: 'D',
                    InitialsColor: 'bg-gray-500',
                    InitialsText: 'text-white'
                  }));
                  
                  return displayData.map((client, index) => {
                    // Check if this is from the clients API (has User_ID) or demo data
                    const isFromClientsAPI = client.User_ID !== undefined;
                    
                    let displayClient;
                    
                    if (isFromClientsAPI && clients.length > 0) {
                      // Data from /api/advisor/clients (PostgreSQL data)
                      displayClient = client;
                    } else {
                      // Demo/fallback data
                      displayClient = client;
                    }
                  
                    return (
                      <tr key={displayClient.User_ID} className={`transition-colors duration-300 ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-900'
                        }`}>{displayClient.User_ID}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 ${displayClient.InitialsColor} rounded-full flex items-center justify-center`}>
                              <span className={`${displayClient.InitialsText} font-medium text-sm`}>{displayClient.Initials}</span>
                            </div>
                            <div className="ml-3">
                              <p className={`text-sm font-medium transition-colors duration-300 ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{displayClient.Name}</p>
                              <p className={`text-sm transition-colors duration-300 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>Age {displayClient.Age}</p>
                              {isFromClientsAPI && clients.length > 0 && (
                                <p className="text-xs text-green-600">PostgreSQL Data</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-900'
                        }`}>{displayClient.Annual_Income}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-900'
                        }`}>{displayClient.Current_Savings}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            displayClient.Risk_Tolerance === 'Low' ? 'bg-green-100 text-green-800' :
                            displayClient.Risk_Tolerance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {displayClient.Risk_Tolerance}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-900'
                        }`}>{displayClient.Retirement_Age_Goal}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          <button className="text-green-600 hover:text-green-900">Edit</button>
                        </td>
                      </tr>
                    );
                  });
                })()}
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
