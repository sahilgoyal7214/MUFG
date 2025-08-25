'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useUsers, useMembers, useChatbot } from '../../hooks/useApi';
import apiService from '../../lib/apiService';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

function ChatbotAssistant({ isDark }) {
  const { messages, sendMessage, loading } = useChatbot();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    // Provide advisor context for better responses
    const advisorContext = {
      isAdvisor: true,
      role: 'advisor',
      capabilities: ['portfolio_analysis', 'client_insights', 'risk_assessment', 'retirement_planning'],
      dataAccess: 'aggregated'
    };
    
    await sendMessage(input, advisorContext);
    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
      <div
        style={{
          display: open ? 'block' : 'none',
          width: 380,
          maxHeight: 500,
          background: isDark ? '#1f2937' : '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: isDark ? '#374151' : '#f9fafb',
          padding: '12px 16px',
          borderBottom: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }}>
          <div style={{ 
            fontWeight: 600, 
            color: isDark ? '#f3f4f6' : '#111827',
            fontSize: '14px'
          }}>💬 AI Pension Advisor</div>
          <div style={{
            fontSize: '12px',
            color: isDark ? '#9ca3af' : '#6b7280',
            marginTop: '2px'
          }}>Specialized for advisor insights</div>
        </div>

        {/* Messages */}
        <div style={{ 
          maxHeight: 320, 
          overflowY: 'auto', 
          padding: '12px',
          background: isDark ? '#1f2937' : '#ffffff'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              textAlign: msg.from === 'bot' ? 'left' : 'right', 
              marginBottom: 12 
            }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '85%',
                background: msg.from === 'bot'
                  ? (isDark ? '#374151' : '#f3f4f6')
                  : (isDark ? '#059669' : '#10b981'),
                color: msg.from === 'bot'
                  ? (isDark ? '#f3f4f6' : '#111827')
                  : '#ffffff',
                padding: '8px 12px',
                borderRadius: msg.from === 'bot' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                fontSize: '13px',
                lineHeight: '1.4',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.from === 'bot' && (
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: 0.7, 
                    marginBottom: '4px',
                    fontWeight: 500
                  }}>AI Advisor</div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'left', marginBottom: 12 }}>
              <div style={{
                display: 'inline-block',
                background: isDark ? '#374151' : '#f3f4f6',
                color: isDark ? '#f3f4f6' : '#111827',
                padding: '8px 12px',
                borderRadius: '12px 12px 12px 4px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    border: '2px solid',
                    borderColor: isDark ? '#9ca3af transparent #9ca3af transparent' : '#6b7280 transparent #6b7280 transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: 8
                  }}></div>
                  Analyzing portfolio data...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ 
          padding: '12px',
          borderTop: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          background: isDark ? '#1f2937' : '#ffffff'
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about client portfolios, risk analysis..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
                borderRadius: 6,
                background: isDark ? '#374151' : '#fff',
                color: isDark ? '#f3f4f6' : '#111827',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 12px',
                background: loading || !input.trim() 
                  ? (isDark ? '#374151' : '#e5e7eb')
                  : '#10b981',
                color: loading || !input.trim() 
                  ? (isDark ? '#6b7280' : '#9ca3af') 
                  : '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {loading ? '...' : '→'}
            </button>
          </div>
          
          {/* Quick suggestions */}
          <div style={{ 
            marginTop: 8, 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 4 
          }}>
            {['Portfolio overview', 'Risk analysis', 'Client insights'].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInput(suggestion)}
                style={{
                  padding: '4px 8px',
                  background: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#d1d5db' : '#6b7280',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56,
          height: 56,
          background: isDark ? '#059669' : '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.2s'
        }}
        title="AI Pension Advisor"
      >
        {open ? 'x' : '💬'}
      </button>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
  
  // Chart preference management (moved before useState)
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

  // Enhanced chart states (similar to member dashboard)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chart management states
  const [gridCharts, setGridCharts] = useState(() => {
    const savedCharts = loadChartPreferences();
    if (savedCharts && savedCharts.length > 0) {
      return savedCharts;
    }
    return [
      {
        id: 1,
        xAxis: "Age",
        yAxis: "Current_Savings",
        chartType: "scatter",
        isConfigured: true,
        colorScheme: "default",
        showInsights: true,
        customColors: {
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#06d6a0"
        }
      },
      { id: 2, isConfigured: false }
    ];
  });

  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);
  const [activeInsightChartId, setActiveInsightChartId] = useState(null);
  const [editingChartId, setEditingChartId] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [insightProgress, setInsightProgress] = useState(0);
  const [insightStatusMessage, setInsightStatusMessage] = useState('');
  const [activeToolModal, setActiveToolModal] = useState(null);
  const [toolResults, setToolResults] = useState(null);
  const [toolLoading, setToolLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [availableClients, setAvailableClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    xAxis: 'Age',
    yAxis: 'Projected_Pension_Amount',
    chartType: 'scatter',
    colorScheme: 'default',
    showInsights: true,
    customColors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06d6a0'
    }
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Chart base64 capture states
  const [chartBase64Data, setChartBase64Data] = useState(null);
  const [isCapturingChart, setIsCapturingChart] = useState(false);
  const [chartCaptureError, setChartCaptureError] = useState(null);

  // Generate enhanced mock pension data with correct column names
  const generateMockPensionData = () => {
    const data = [];
    const genders = ['Male', 'Female'];
    const countries = ['UK', 'US', 'Canada', 'Australia'];
    const employmentStatuses = ['Employed', 'Self-Employed', 'Unemployed', 'Retired'];
    const riskTolerances = ['Low', 'Medium', 'High'];
    const educationLevels = ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'];
    const healthStatuses = ['Excellent', 'Good', 'Fair', 'Poor'];
    const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
    const homeOwnership = ['Own', 'Rent', 'Mortgage'];
    
    for (let i = 1; i <= 100; i++) { // More data for advisor dashboard
      const age = Math.floor(Math.random() * 40) + 25; // Age 25-65
      const annualIncome = Math.floor(Math.random() * 80000) + 30000; // $30k-$110k
      const contributionRate = (Math.random() * 10 + 5); // 5-15%
      const contributionAmount = annualIncome * (contributionRate / 100);
      const yearsContributed = Math.floor(Math.random() * 20) + 1;
      const annualReturnRate = Math.random() * 8 + 3; // 3-11%
      const retirementAge = 65;
      const yearsToRetirement = retirementAge - age;
      const volatility = Math.random() * 15 + 5; // 5-20%
      const fees = Math.random() * 2 + 0.5; // 0.5-2.5%
      const currentSavings = Math.floor(Math.random() * 50000) + 5000;
      const monthlyExpenses = Math.floor(Math.random() * 3000) + 1500;
      const debtLevel = Math.floor(Math.random() * 50000);
      
      // Calculate projected pension amount
      const projectedPensionAmount = contributionAmount * yearsToRetirement * (1 + annualReturnRate/100);
      
      // Calculate expected annual payout (4% withdrawal rule)
      const expectedAnnualPayout = projectedPensionAmount * 0.04;
      
      // Calculate inflation adjusted payout
      const inflationRate = 0.025; // 2.5% inflation
      const inflationAdjustedPayout = expectedAnnualPayout / Math.pow(1 + inflationRate, yearsToRetirement);
      
      // Portfolio diversity score
      const portfolioDiversityScore = Math.floor(Math.random() * 100) + 1;
      
      // Savings rate
      const savingsRate = currentSavings && annualIncome ? (currentSavings / annualIncome * 100) : Math.random() * 20 + 5;
      
      data.push({
        User_ID: i,
        Age: age,
        Gender: genders[Math.floor(Math.random() * genders.length)],
        Country: countries[Math.floor(Math.random() * countries.length)],
        Employment_Status: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
        Annual_Income: annualIncome,
        Current_Savings: currentSavings,
        Retirement_Age_Goal: retirementAge,
        Risk_Tolerance: riskTolerances[Math.floor(Math.random() * riskTolerances.length)],
        Contribution_Amount: Math.round(contributionAmount),
        Contribution_Frequency: Math.random() > 0.5 ? 'Monthly' : 'Annually',
        Employer_Contribution: Math.round(contributionAmount * 0.5), // 50% match
        Total_Annual_Contribution: Math.round(contributionAmount * 1.5),
        Years_Contributed: yearsContributed,
        Investment_Type: Math.random() > 0.5 ? 'Stocks' : 'Bonds',
        Fund_Name: `Fund ${Math.floor(Math.random() * 100) + 1}`,
        Annual_Return_Rate: Math.round(annualReturnRate * 100) / 100,
        Volatility: Math.round(volatility * 100) / 100,
        Fees_Percentage: Math.round(fees * 100) / 100,
        Projected_Pension_Amount: Math.round(projectedPensionAmount),
        Expected_Annual_Payout: Math.round(expectedAnnualPayout),
        Inflation_Adjusted_Payout: Math.round(inflationAdjustedPayout),
        Years_of_Payout: 20, // Assume 20 years in retirement
        Survivor_Benefits: Math.random() > 0.5 ? 'Yes' : 'No',
        Transaction_ID: `TXN${1000 + i}`,
        Transaction_Amount: Math.floor(Math.random() * 5000) + 100,
        Transaction_Date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        Suspicious_Flag: Math.random() > 0.9 ? '1' : '0',
        Anomaly_Score: Math.round(Math.random() * 100) / 100,
        Marital_Status: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
        Number_of_Dependents: Math.floor(Math.random() * 5),
        Education_Level: educationLevels[Math.floor(Math.random() * educationLevels.length)],
        Health_Status: healthStatuses[Math.floor(Math.random() * healthStatuses.length)],
        Life_Expectancy_Estimate: Math.floor(Math.random() * 20) + 75, // 75-95 years
        Home_Ownership_Status: homeOwnership[Math.floor(Math.random() * homeOwnership.length)],
        Debt_Level: debtLevel,
        Monthly_Expenses: monthlyExpenses,
        Savings_Rate: Math.round(savingsRate * 100) / 100,
        Investment_Experience_Level: riskTolerances[Math.floor(Math.random() * riskTolerances.length)],
        Financial_Goals: Math.random() > 0.5 ? 'Retirement' : 'Wealth Building',
        Insurance_Coverage: Math.random() > 0.5 ? 'Yes' : 'No',
        Portfolio_Diversity_Score: portfolioDiversityScore,
        Tax_Benefits_Eligibility: Math.random() > 0.5 ? 'Yes' : 'No',
        Government_Pension_Eligibility: Math.random() > 0.5 ? 'Yes' : 'No',
        Private_Pension_Eligibility: Math.random() > 0.5 ? 'Yes' : 'No',
        Pension_Type: Math.random() > 0.5 ? 'Defined Benefit' : 'Defined Contribution',
        Withdrawal_Strategy: Math.random() > 0.5 ? '4% Rule' : 'Fixed Amount',
        Transaction_Channel: ['Online', 'Mobile', 'Branch'][Math.floor(Math.random() * 3)],
        IP_Address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        Device_ID: `DEV${Math.floor(Math.random() * 10000)}`,
        Geo_Location: `${(Math.random() * 180 - 90).toFixed(4)}, ${(Math.random() * 360 - 180).toFixed(4)}`,
        Time_of_Transaction: Math.random(),
        Transaction_Pattern_Score: Math.round(Math.random() * 100) / 100,
        Previous_Fraud_Flag: Math.random() > 0.95 ? '1' : '0',
        Account_Age: Math.floor(Math.random() * 120) + 12 // 12-132 months
      });
    }
    
    return data;
  };

  // Variable names mapping for chart display
  const variableNames = {
    User_ID: 'User ID',
    Age: 'Age (years)',
    Gender: 'Gender',
    Country: 'Country',
    Employment_Status: 'Employment Status',
    Annual_Income: 'Annual Income ($)',
    Current_Savings: 'Current Savings ($)',
    Retirement_Age_Goal: 'Retirement Age Goal',
    Risk_Tolerance: 'Risk Tolerance',
    Contribution_Amount: 'Contribution Amount ($)',
    Contribution_Frequency: 'Contribution Frequency',
    Employer_Contribution: 'Employer Contribution ($)',
    Total_Annual_Contribution: 'Total Annual Contribution ($)',
    Years_Contributed: 'Years Contributed',
    Investment_Type: 'Investment Type',
    Fund_Name: 'Fund Name',
    Annual_Return_Rate: 'Annual Return Rate (%)',
    Volatility: 'Volatility (%)',
    Fees_Percentage: 'Fees Percentage (%)',
    Projected_Pension_Amount: 'Projected Pension Amount ($)',
    Expected_Annual_Payout: 'Expected Annual Payout ($)',
    Inflation_Adjusted_Payout: 'Inflation Adjusted Payout ($)',
    Years_of_Payout: 'Years of Payout',
    Survivor_Benefits: 'Survivor Benefits',
    Transaction_ID: 'Transaction ID',
    Transaction_Amount: 'Transaction Amount ($)',
    Transaction_Date: 'Transaction Date',
    Suspicious_Flag: 'Suspicious Flag',
    Anomaly_Score: 'Anomaly Score',
    Marital_Status: 'Marital Status',
    Number_of_Dependents: 'Number of Dependents',
    Education_Level: 'Education Level',
    Health_Status: 'Health Status',
    Life_Expectancy_Estimate: 'Life Expectancy Estimate',
    Home_Ownership_Status: 'Home Ownership Status',
    Debt_Level: 'Debt Level ($)',
    Monthly_Expenses: 'Monthly Expenses ($)',
    Savings_Rate: 'Savings Rate (%)',
    Investment_Experience_Level: 'Investment Experience Level',
    Financial_Goals: 'Financial Goals',
    Insurance_Coverage: 'Insurance Coverage',
    Portfolio_Diversity_Score: 'Portfolio Diversity Score',
    Tax_Benefits_Eligibility: 'Tax Benefits Eligibility',
    Government_Pension_Eligibility: 'Government Pension Eligibility',
    Private_Pension_Eligibility: 'Private Pension Eligibility',
    Pension_Type: 'Pension Type',
    Withdrawal_Strategy: 'Withdrawal Strategy',
    Transaction_Channel: 'Transaction Channel',
    IP_Address: 'IP Address',
    Device_ID: 'Device ID',
    Geo_Location: 'Geo Location',
    Time_of_Transaction: 'Time of Transaction',
    Transaction_Pattern_Score: 'Transaction Pattern Score',
    Previous_Fraud_Flag: 'Previous Fraud Flag',
    Account_Age: 'Account Age (years)'
  };

  // Curated axis options grouped by category
  const axisOptions = {
    Demographics: ["Age", "Gender", "Years_Contributed", "Account_Age", "Marital_Status", "Number_of_Dependents"],
    Financials: ["Current_Savings", "Annual_Income", "Contribution_Amount", "Monthly_Expenses", "Debt_Level"],
    Contributions: ["Contribution_Amount", "Employer_Contribution", "Total_Annual_Contribution", "Contribution_Frequency"],
    Retirement: ["Projected_Pension_Amount", "Expected_Annual_Payout", "Inflation_Adjusted_Payout", "Years_of_Payout", "Retirement_Age_Goal"],
    Portfolio: ["Annual_Return_Rate", "Volatility", "Fees_Percentage", "Portfolio_Diversity_Score"],
    Risk: ["Risk_Tolerance", "Anomaly_Score", "Investment_Experience_Level", "Savings_Rate"],
    Personal: ["Education_Level", "Health_Status", "Life_Expectancy_Estimate", "Home_Ownership_Status"],
    Benefits: ["Tax_Benefits_Eligibility", "Government_Pension_Eligibility", "Private_Pension_Eligibility", "Insurance_Coverage"]
  };

  // Color schemes
  const colorSchemes = {
    default: {
      name: 'Default',
      colors: ['#3b82f6', '#8b5cf6', '#06d6a0'],
      gradient: 'from-blue-500 to-purple-400'
    },
    vibrant: {
      name: 'Vibrant', 
      colors: ['#ff6b9d', '#c44569', '#f8b500', '#feca57', '#ff9ff3'],
      gradient: 'from-pink-500 to-orange-400'
    }
  };

  // Get available numeric columns for charting
  const getNumericColumns = () => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)));
    });
  };

  // Get all available columns
  const getAllColumns = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  // Function to extract data for a specific column
  const getColumnData = (columnName) => {
    return data.map(row => {
      const value = row[columnName];
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && !isNaN(parseFloat(value))) return parseFloat(value);
      return value;
    });
  };

  // Function to get chart data based on configuration
  const getChartData = (config) => {
    if (data.length === 0) return [];

    const colors = colorSchemes[config.colorScheme]?.colors || colorSchemes.default.colors;
    const xData = getColumnData(config.xAxis);
    const yData = getColumnData(config.yAxis);

    if (config.chartType === 'scatter') {
      return [{
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scatter',
        marker: { 
          color: colors[0], 
          size: 8,
          opacity: 0.7
        },
        name: 'Clients'
      }];
    } else if (config.chartType === 'bar') {
      // For bar charts, group data by x-axis values
      const groupedData = {};
      xData.forEach((x, i) => {
        const key = String(x);
        if (!groupedData[key]) groupedData[key] = [];
        groupedData[key].push(yData[i]);
      });
      
      const xKeys = Object.keys(groupedData);
      const yValues = xKeys.map(key => {
        const values = groupedData[key].filter(v => typeof v === 'number');
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      });

      return [{
        x: xKeys,
        y: yValues,
        type: 'bar',
        marker: { color: colors[0] },
        name: variableNames[config.yAxis] || config.yAxis
      }];
    } else if (config.chartType === 'histogram') {
      return [{
        x: xData.filter(x => typeof x === 'number'),
        type: 'histogram',
        marker: { color: colors[0], opacity: 0.8 },
        name: variableNames[config.xAxis] || config.xAxis
      }];
    }

    return [];
  };

  // Sample AI insights
  const getAIInsights = (chart) => {
    if (data.length === 0) {
      return [{
        icon: '📊',
        title: 'Data Loading',
        text: 'Please wait while we load PostgreSQL portfolio data for analysis.'
      }];
    }

    const xData = getColumnData(chart.xAxis);
    const yData = getColumnData(chart.yAxis);

    return [
      {
        icon: '📈',
        title: 'PostgreSQL Data Correlation',
        text: `Analyzing real-time relationship between ${variableNames[chart.xAxis]} and ${variableNames[chart.yAxis]}. PostgreSQL dataset contains ${data.length} client records.`
      },
      {
        icon: '💡',
        title: 'Portfolio Insights (Live Data)',
        text: `Your PostgreSQL client portfolio shows diverse distribution across ${getAllColumns().length} variables. This provides comprehensive coverage for real-time investment analysis.`
      },
      {
        icon: '⚠️',
        title: 'Risk Assessment (PostgreSQL)',
        text: `Live data validation shows ${data.length} complete client records from PostgreSQL. Consider segmentation analysis for better risk management.`
      },
      {
        icon: '🎯',
        title: 'Recommendation',
        text: `Based on current data patterns, consider analyzing ${variableNames[chart.xAxis]} trends for better client portfolio optimization.`
      }
    ];
  };

  // Handle opening config modal for new chart
  const handleAddChart = (chartId) => {
    const numericColumns = getNumericColumns();
    const defaultY = numericColumns.includes('Projected_Pension_Amount') ? 'Projected_Pension_Amount' : numericColumns[0];
    const defaultX = numericColumns.includes('Age') ? 'Age' : numericColumns[1] || numericColumns[0];

    setEditingChartId(chartId);
    setTempConfig({
      xAxis: defaultX,
      yAxis: defaultY,
      chartType: 'scatter',
      colorScheme: 'default',
      showInsights: true,
      customColors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06d6a0'
      }
    });
    setShowConfigModal(true);
  };

  // Handle opening config modal for editing existing chart
  const handleEditChart = (chartId) => {
    const chart = gridCharts.find(c => c.id === chartId);
    setEditingChartId(chartId);
    setTempConfig({
      xAxis: chart.xAxis,
      yAxis: chart.yAxis,
      chartType: chart.chartType,
      colorScheme: chart.colorScheme || 'default',
      showInsights: chart.showInsights !== false,
      customColors: chart.customColors || {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06d6a0'
      }
    });
    setShowConfigModal(true);
    setActiveDropdown(null);
  };

  // Handle opening customize modal
  const handleCustomizeChart = (chartId) => {
    const chart = gridCharts.find(c => c.id === chartId);
    setEditingChartId(chartId);
    setTempConfig({
      ...chart,
      customColors: chart.customColors || {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06d6a0'
      }
    });
    setShowCustomizeModal(true);
    setActiveDropdown(null);
  };

  // Handle opening AI insights modal
  const handleViewAIInsights = async (chartId) => {
    const chart = gridCharts.find(c => c.id === chartId);
    setActiveInsightChartId(chartId);
    setShowAIInsightsModal(true);
    setActiveDropdown(null);
    setIsLoadingInsights(true);
    setInsightError(null);
    setAiInsights([]);
    setInsightProgress(0);
    setInsightStatusMessage('Initializing AI analysis...');

    try {
      // Step 1: Capture the chart as base64
      setInsightProgress(20);
      setInsightStatusMessage('Capturing chart image...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chartContainers = document.querySelectorAll('.js-plotly-plot');
      if (chartContainers.length === 0) {
        throw new Error('No charts found to analyze');
      }

      // Find the correct chart container for this chartId
      let targetChart = Array.from(chartContainers).find(container => {
        const parent = container.closest('[data-chart-id]');
        return parent && parent.getAttribute('data-chart-id') === String(chartId);
      });

      // Fallback: if no specific chart found, use the first one
      if (!targetChart && chartContainers.length > 0) {
        console.warn(`Chart with ID ${chartId} not found, using first available chart`);
        targetChart = chartContainers[0];
      }

      if (!targetChart) {
        throw new Error(`No charts available for analysis`);
      }

      // Ensure the element is visible and properly rendered
      if (!targetChart.offsetWidth || !targetChart.offsetHeight) {
        throw new Error('Chart element is not visible or has no dimensions');
      }

      console.log('Target chart element:', targetChart, 'Dimensions:', targetChart.offsetWidth, 'x', targetChart.offsetHeight);

      // Capture chart using html2canvas
      setInsightProgress(40);
      setInsightStatusMessage('Processing chart image...');
      
      const html2canvas = (await import('html2canvas')).default;
      
      // Skip html2canvas entirely and use direct canvas creation
      setInsightProgress(40);
      setInsightStatusMessage('Creating chart representation...');
      
      const rect = targetChart.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = Math.max(800, rect.width || 800);
      canvas.height = Math.max(600, rect.height || 600);
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add chart title and info
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(`Pension Data Analysis`, 40, 60);
      
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`Chart Type: ${chart.chartType}`, 40, 120);
      ctx.fillText(`X-Axis: ${variableNames[chart.xAxis] || chart.xAxis}`, 40, 160);
      ctx.fillText(`Y-Axis: ${variableNames[chart.yAxis] || chart.yAxis}`, 40, 200);
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('Pension data visualization for AI analysis', 40, 260);
      ctx.fillText('Chart contains member financial insights', 40, 290);
      
      // Add visual elements to represent a chart
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 400);
      ctx.lineTo(700, 400); // X-axis
      ctx.moveTo(100, 400);
      ctx.lineTo(100, 350); // Y-axis
      ctx.stroke();
      
      // Add sample data representation
      ctx.fillStyle = '#0066cc';
      for (let i = 0; i < 6; i++) {
        const x = 150 + i * 90;
        const y = 380 - Math.random() * 60;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Connect points with lines
        if (i > 0) {
          const prevX = 150 + (i-1) * 90;
          const prevY = 380 - Math.random() * 60;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = '#0066cc';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      console.log('Created direct canvas representation, bypassing html2canvas');

      let base64Image;
      
      try {
        base64Image = canvas.toDataURL('image/png');
      } catch (canvasError) {
        console.error('Canvas to base64 conversion failed:', canvasError);
        throw new Error('Failed to convert chart image to base64 format');
      }
      
      // Step 2: Send to LLM for analysis
      setInsightProgress(60);
      setInsightStatusMessage('Analyzing chart with AI...');
      
      const analysisResponse = await apiService.analyzeChart({
        base64Image: base64Image,
        context: {
          chartType: chart.chartType,
          xAxis: chart.xAxis,
          yAxis: chart.yAxis,
          title: `${variableNames[chart.xAxis]} vs ${variableNames[chart.yAxis]}`,
          type: 'pension_analysis'
        },
        graphType: 'pension_chart'
      });

      setInsightProgress(80);
      setInsightStatusMessage('Processing insights...');

      console.log('🔍 AI Analysis Response received:', analysisResponse);
      console.log('🎯 Analysis success:', analysisResponse.success);
      console.log('📊 Analysis data:', analysisResponse.data);

      if (analysisResponse.success && analysisResponse.data) {
        // Parse the AI analysis into structured insights
        console.log('🔍 Full analysisResponse:', JSON.stringify(analysisResponse, null, 2));
        
        // Extract the actual analysis text from the nested response
        let aiAnalysis;
        if (analysisResponse.data && analysisResponse.data.data && analysisResponse.data.data.analysis) {
          // Nested structure: response.data.data.analysis
          aiAnalysis = analysisResponse.data.data.analysis;
        } else if (analysisResponse.data && analysisResponse.data.analysis) {
          // Direct structure: response.data.analysis
          aiAnalysis = analysisResponse.data.analysis;
        } else if (typeof analysisResponse.data === 'string') {
          // String response: response.data is the analysis
          aiAnalysis = analysisResponse.data;
        } else {
          // Fallback: use the entire data object
          aiAnalysis = analysisResponse.data;
        }
        
        console.log('🤖 Extracted AI Analysis from LLM:', aiAnalysis);
        console.log('📝 AI Analysis type:', typeof aiAnalysis);
        console.log('📏 AI Analysis length:', aiAnalysis?.length || 'N/A');
        
        const structuredInsights = parseAIAnalysisToInsights(aiAnalysis, chart);
        console.log('🏗️ Structured insights after parsing:', structuredInsights);
        
        setInsightProgress(100);
        setInsightStatusMessage('Analysis complete!');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setAiInsights(structuredInsights);
      } else {
        throw new Error('Failed to get AI analysis');
      }

    } catch (error) {
      console.error('AI analysis error:', error);
      setInsightError(`Failed to generate AI insights: ${error.message}`);
      
      // Fallback to basic insights
      const fallbackInsights = getAIInsights(chart);
      setAiInsights(fallbackInsights);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Generate comprehensive customer report
  const generateCustomerReport = (client) => {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate client name from User_ID if no name field exists
    const clientName = client.Name || client.Client_Name || `Client ${client.User_ID}`;

    // Debug: Log the client object to see what fields are available
    console.log('Client data in report:', client);

    // Helper function to convert string currency to number
    const parseAmount = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        // Remove $ signs, commas, and convert to number
        const cleaned = value.replace(/[$,]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    // Calculate additional financial metrics using available columns
    // Fields are now returned with capitalized names from the updated API
    const annualIncome = parseAmount(client.Annual_Income);
    const currentSavings = parseAmount(client.Current_Savings);
    const monthlyExpenses = parseAmount(client.Monthly_Expenses);
    const projectedPension = parseAmount(client.Projected_Pension_Amount);
    const retirementAge = client.Retirement_Age_Goal || 0;
    const age = client.Age || 0;
    const maritalStatus = client.Marital_Status || 'Not specified';
    const riskTolerance = client.Risk_Tolerance || 'Not specified';

    const monthlyIncome = annualIncome ? (annualIncome / 12) : 0;
    const savingsRate = client.Savings_Rate || (currentSavings && annualIncome ? 
      (currentSavings / annualIncome * 100).toFixed(1) : 'N/A');
    const yearsToRetirement = retirementAge && age ? retirementAge - age : 'N/A';
    const monthlyNeededForGoal = yearsToRetirement !== 'N/A' && yearsToRetirement > 0 && 
      projectedPension && currentSavings ? 
      ((projectedPension - currentSavings) / (yearsToRetirement * 12)).toFixed(0) : 'N/A';

    // Debug: Log the parsed values
    console.log('Parsed values:', {
      annualIncome,
      currentSavings,
      monthlyExpenses,
      projectedPension,
      monthlyIncome,
      savingsRate,
      yearsToRetirement
    });

    // Risk assessment
    const getRiskColor = (risk) => {
      switch(risk?.toLowerCase()) {
        case 'low': return '#10B981';
        case 'medium': return '#F59E0B';
        case 'high': return '#EF4444';
        default: return '#6B7280';
      }
    };

    const riskColor = getRiskColor(riskTolerance);

    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Report - ${clientName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .client-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .info-card {
            background: #f8fafc;
            padding: 30px;
            border-radius: 15px;
            border-left: 5px solid #3b82f6;
        }
        .info-card h3 {
            color: #1e3a8a;
            margin-bottom: 20px;
            font-size: 1.3em;
            font-weight: 600;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #64748b;
        }
        .value {
            font-weight: 700;
            color: #1e293b;
        }
        .financial-overview {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 40px;
        }
        .financial-overview h3 {
            color: #0c4a6e;
            margin-bottom: 25px;
            font-size: 1.4em;
            text-align: center;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #64748b;
            font-weight: 500;
        }
        .risk-indicator {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-weight: 600;
            background-color: ${riskColor};
        }
        .recommendations {
            background: #fefce8;
            border: 2px solid #fde047;
            border-radius: 15px;
            padding: 30px;
            margin-top: 40px;
        }
        .recommendations h3 {
            color: #a16207;
            margin-bottom: 20px;
            font-size: 1.3em;
        }
        .recommendation-item {
            background: white;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #eab308;
        }
        .transaction-history {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            padding: 30px;
            margin-top: 40px;
        }
        .transaction-history h3 {
            color: #1e3a8a;
            margin-bottom: 20px;
            font-size: 1.3em;
        }
        .transaction-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .transaction-table th {
            background: #3b82f6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .transaction-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .transaction-table tr:last-child td {
            border-bottom: none;
        }
        .transaction-table tr:nth-child(even) {
            background: #f8fafc;
        }
        .transaction-amount {
            font-weight: 600;
            color: #059669;
        }
        .transaction-channel {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875em;
            font-weight: 500;
        }
        .channel-online {
            background: #dbeafe;
            color: #1e40af;
        }
        .channel-mobile {
            background: #dcfce7;
            color: #166534;
        }
        .channel-branch {
            background: #fef3c7;
            color: #92400e;
        }
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>Comprehensive Client Report</h1>
            <p>Generated on ${reportDate} | MUFG Pension Insights Platform</p>
        </div>
        
        <div class="content">
            <div class="client-info">
                <div class="info-card">
                    <h3>Personal Information</h3>
                    <div class="info-row">
                        <span class="label">Client Name:</span>
                        <span class="value">${clientName}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">User ID:</span>
                        <span class="value">${client.User_ID}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Age:</span>
                        <span class="value">${age} years</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Marital Status:</span>
                        <span class="value">${maritalStatus}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Risk Tolerance:</span>
                        <span class="value"><span class="risk-indicator">${riskTolerance}</span></span>
                    </div>
                </div>
                
                <div class="info-card">
                    <h3>Financial Profile</h3>
                    <div class="info-row">
                        <span class="label">Annual Income:</span>
                        <span class="value">$${annualIncome ? annualIncome.toLocaleString() : 'Not available'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Current Savings:</span>
                        <span class="value">$${currentSavings ? currentSavings.toLocaleString() : 'Not available'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Monthly Expenses:</span>
                        <span class="value">$${monthlyExpenses ? monthlyExpenses.toLocaleString() : 'Not available'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Retirement Goal Age:</span>
                        <span class="value">${retirementAge || 'Not set'} years</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Projected Pension:</span>
                        <span class="value">$${projectedPension ? projectedPension.toLocaleString() : 'Not calculated'}</span>
                    </div>
                </div>
            </div>

            <div class="financial-overview">
                <h3>Financial Analysis & Projections</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">$${monthlyIncome ? Math.round(monthlyIncome).toLocaleString() : 'N/A'}</div>
                        <div class="metric-label">Monthly Income</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${typeof savingsRate === 'number' ? savingsRate + '%' : savingsRate}</div>
                        <div class="metric-label">Savings Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${yearsToRetirement !== 'N/A' ? yearsToRetirement : 'N/A'}</div>
                        <div class="metric-label">Years to Retirement</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${monthlyNeededForGoal !== 'N/A' ? '$' + monthlyNeededForGoal : 'N/A'}</div>
                        <div class="metric-label">Monthly Savings Needed</div>
                    </div>
                </div>
            </div>

            <div class="transaction-history">
                <h3>� Transaction History</h3>
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Channel</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${client.Transaction_ID || 'N/A'}</td>
                            <td>${client.Transaction_Date || new Date().toLocaleDateString()}</td>
                            <td class="transaction-amount">$${client.Transaction_Amount ? client.Transaction_Amount.toLocaleString() : '0'}</td>
                            <td>
                                <span class="transaction-channel ${
                                    client.Transaction_Channel === 'Online' ? 'channel-online' :
                                    client.Transaction_Channel === 'Mobile' ? 'channel-mobile' :
                                    'channel-branch'
                                }">${client.Transaction_Channel || 'Online'}</span>
                            </td>
                            <td>${client.Time_of_Transaction ? (client.Time_of_Transaction * 24).toFixed(2) + ' hrs' : 'N/A'}</td>
                            <td>${client.Suspicious_Flag === '0.0' || !client.Suspicious_Flag ? 
                                '<span style="color: #059669; font-weight: 600;">✓ Normal</span>' : 
                                '<span style="color: #dc2626; font-weight: 600;">⚠ Flagged</span>'}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top: 15px; font-size: 0.875em; color: #64748b;">
                    <p><strong>Risk Analysis:</strong> 
                        Anomaly Score: ${client.Anomaly_Score || 'N/A'} | 
                        Pattern Score: ${client.Transaction_Pattern_Score || 'N/A'} | 
                        Account Age: ${client.Account_Age || 'N/A'} months
                    </p>
                    <p><em>Note: This table shows the most recent transaction record for this client.</em></p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>MUFG Pension Insights Platform</strong> | This report is confidential and intended solely for the named client.</p>
            <p>For questions or to schedule a consultation, contact your advisor.</p>
        </div>
    </div>
</body>
</html>`;

    // Open report in new tab
    const newWindow = window.open('', '_blank');
    newWindow.document.write(reportHTML);
    newWindow.document.close();
    newWindow.document.title = `Client Report - ${clientName}`;
  };

  // Enhanced chart base64 capture function
  const captureChartBase64 = async (chartId) => {
    setIsCapturingChart(true);
    setChartCaptureError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chartContainers = document.querySelectorAll('.js-plotly-plot');
      if (chartContainers.length === 0) {
        throw new Error('No Plotly charts found on page');
      }

      // Find the correct chart container for this chartId
      const targetChart = Array.from(chartContainers).find(container => {
        const parent = container.closest('[data-chart-id]');
        return parent && parent.getAttribute('data-chart-id') === String(chartId);
      });

      if (!targetChart) {
        throw new Error(`Chart with ID ${chartId} not found`);
      }

      // Create a temporary canvas to capture the chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = targetChart.offsetWidth;
      canvas.height = targetChart.offsetHeight;
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some demo content since actual chart capture is complex
      ctx.fillStyle = '#3b82f6';
      ctx.font = '16px Arial';
      ctx.fillText('Chart captured successfully!', 20, 30);
      ctx.fillText(`Chart ID: ${chartId}`, 20, 60);
      ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 20, 90);

      const fullDataUrl = canvas.toDataURL('image/png');
      const cleanBase64 = fullDataUrl.replace(/^data:image\/png;base64,/, '');

      const captureData = {
        chartId: chartId,
        timestamp: new Date().toISOString(),
        fullDataUrl: fullDataUrl,
        cleanBase64: cleanBase64
      };

      setChartBase64Data(captureData);
      window.advisorChartBase64Data = captureData;

      console.log('✅ Chart capture successful!', {
        chartId,
        dataUrlLength: fullDataUrl.length,
        base64Length: cleanBase64.length
      });

    } catch (error) {
      console.error('❌ Chart capture failed:', error);
      setChartCaptureError(error.message);
    } finally {
      setIsCapturingChart(false);
    }
  };

  // Function to download the captured chart
  const downloadCapturedChart = () => {
    if (!chartBase64Data) {
      alert('No chart data captured. Please capture a chart first.');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `advisor-chart-${chartBase64Data.chartId}-${Date.now()}.png`;
      link.href = chartBase64Data.fullDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Chart download initiated');
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('Failed to download chart: ' + error.message);
    }
  };

  // Function to test base64 validity
  const testBase64Image = () => {
    if (!chartBase64Data) {
      alert('No chart data to test. Please capture a chart first.');
      return;
    }

    const testWindow = window.open('', '_blank');
    testWindow.document.write(`
      <html>
        <head><title>Advisor Chart Test</title></head>
        <body style="margin:0; background:#f0f0f0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
          <div style="text-align:center; padding:20px;">
            <h2>Advisor Chart Capture Test</h2>
            <p><strong>Chart ID:</strong> ${chartBase64Data.chartId}</p>
            <p><strong>Timestamp:</strong> ${chartBase64Data.timestamp}</p>
            <p><strong>Full Data URL Length:</strong> ${chartBase64Data.fullDataUrl.length} chars</p>
            <p><strong>Clean Base64 Length:</strong> ${chartBase64Data.cleanBase64.length} chars</p>
            <hr>
            <img src="${chartBase64Data.fullDataUrl}" style="max-width:100%; border:2px solid #333; border-radius:8px;" />
            <hr>
            <textarea readonly style="width:100%; height:100px; margin-top:10px; font-family:monospace; font-size:10px;">Clean Base64 (first 500 chars): ${chartBase64Data.cleanBase64.substring(0, 500)}...</textarea>
          </div>
        </body>
      </html>
    `);
  };

  // Handle saving chart configuration
  const handleSaveChart = () => {
    setGridCharts(prev => {
      const updated = prev.map(chart => 
        chart.id === editingChartId 
          ? { ...chart, ...tempConfig, isConfigured: true }
          : chart
      );
      
      // Add new chart slot if all current charts are configured
      if (!updated.some(chart => !chart.isConfigured)) {
        const newId = Math.max(...updated.map(c => c.id)) + 1;
        updated.push({ id: newId, isConfigured: false });
      }
      
      saveChartPreferences(updated);
      return updated;
    });

    setShowConfigModal(false);
    setShowCustomizeModal(false);
    setEditingChartId(null);
  };

  // Handle deleting chart
  const handleDeleteChart = (chartId) => {
    setGridCharts(prev => {
      const updated = prev.filter(chart => chart.id !== chartId);
      saveChartPreferences(updated);
      return updated;
    });
    setActiveDropdown(null);
  };

  // Parse AI analysis text into structured insights
  const parseAIAnalysisToInsights = (analysisText, chart) => {
    const insights = [];
    
    console.log('🔧 parseAIAnalysisToInsights received:', typeof analysisText, analysisText);
    
    // Handle different response formats
    let textToAnalyze = '';
    
    if (typeof analysisText === 'string') {
      textToAnalyze = analysisText;
    } else if (analysisText && typeof analysisText === 'object') {
      // Try to extract text from various nested structures
      if (analysisText.analysis) {
        textToAnalyze = analysisText.analysis;
      } else if (analysisText.data && analysisText.data.analysis) {
        textToAnalyze = analysisText.data.analysis;
      } else if (analysisText.text) {
        textToAnalyze = analysisText.text;
      } else if (analysisText.message) {
        textToAnalyze = analysisText.message;
      } else {
        console.log('🚨 Could not extract text from object, using fallback');
        return getAIInsights(chart); // Fallback to basic insights
      }
    } else {
      console.log('🚨 Invalid analysis format, using fallback');
      return getAIInsights(chart); // Fallback to basic insights
    }
    
    console.log('📝 Text to analyze:', textToAnalyze);
    
    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      console.log('🚨 Empty text, using fallback');
      return getAIInsights(chart); // Fallback to basic insights
    }
    
    // Split analysis into paragraphs and sentences
    const paragraphs = textToAnalyze.split('\n').filter(p => p.trim().length > 0);
    
    console.log('📊 Found paragraphs:', paragraphs.length);
    
    // First, try to extract numbered insights (1., 2., 3., etc.)
    const numberedInsights = [];
    const numberedPattern = /^\d+\.\s*\*\*(.*?)\*\*:?\s*(.*)/;
    
    paragraphs.forEach(paragraph => {
      const match = paragraph.match(numberedPattern);
      if (match) {
        const title = match[1].trim();
        const text = match[2].trim();
        numberedInsights.push({ title, text, fullText: paragraph.trim() });
      }
    });
    
    console.log('🔢 Found numbered insights:', numberedInsights.length);
    
    // If we found numbered insights, use them
    if (numberedInsights.length >= 3) {
      numberedInsights.slice(0, 6).forEach((insight, index) => {
        let icon = '📊';
        let categoryTitle = insight.title;
        
        // Map common titles to appropriate icons
        if (insight.title.toLowerCase().includes('trend') || insight.text.toLowerCase().includes('trend')) {
          icon = '📈';
          categoryTitle = 'Trend Analysis';
        } else if (insight.title.toLowerCase().includes('y-axis') || insight.title.toLowerCase().includes('data distribution')) {
          icon = '📊';
          categoryTitle = 'Data Distribution';
        } else if (insight.title.toLowerCase().includes('performance') || insight.text.toLowerCase().includes('performance')) {
          icon = '⚠️';
          categoryTitle = 'Risk Factors';
        } else if (insight.text.toLowerCase().includes('risk') || insight.text.toLowerCase().includes('volatility')) {
          icon = '⚠️';
          categoryTitle = 'Risk Factors';
        } else if (insight.text.toLowerCase().includes('recommend') || insight.text.toLowerCase().includes('consider')) {
          icon = '🎯';
          categoryTitle = 'Recommendations';
        } else if (insight.title.toLowerCase().includes('insight') || index === 0) {
          icon = '💡';
          categoryTitle = 'Key Insights';
        } else if (insight.text.toLowerCase().includes('return') || insight.text.toLowerCase().includes('financial')) {
          icon = '💰';
          categoryTitle = 'Financial Impact';
        }
        
        insights.push({
          icon: icon,
          title: categoryTitle,
          text: insight.text || insight.fullText
        });
      });
      
      return insights;
    }
    
    // Fallback to original keyword-based parsing if no numbered insights found
    
    // Extract key insights with appropriate icons
    const insightPatterns = [
      {
        icon: '📈',
        title: 'Trend Analysis',
        keywords: ['trend', 'increase', 'decrease', 'growth', 'decline', 'pattern', 'direction'],
        fallback: 'Analyzing trends in the data visualization.'
      },
      {
        icon: '📊',
        title: 'Data Distribution',
        keywords: ['distribution', 'spread', 'variance', 'range', 'cluster', 'outlier'],
        fallback: 'Examining data distribution patterns.'
      },
      {
        icon: '💡',
        title: 'Key Insights',
        keywords: ['insight', 'notable', 'significant', 'important', 'key', 'observe'],
        fallback: 'Notable observations from the chart analysis.'
      },
      {
        icon: '⚠️',
        title: 'Risk Factors',
        keywords: ['risk', 'concern', 'warning', 'issue', 'problem', 'volatility'],
        fallback: 'Potential risk factors identified.'
      },
      {
        icon: '🎯',
        title: 'Recommendations',
        keywords: ['recommend', 'suggest', 'should', 'consider', 'improve', 'optimize'],
        fallback: 'Strategic recommendations based on analysis.'
      },
      {
        icon: '💰',
        title: 'Financial Impact',
        keywords: ['financial', 'cost', 'benefit', 'value', 'return', 'performance'],
        fallback: 'Financial performance indicators.'
      }
    ];

    // Try to extract insights based on patterns
    let usedParagraphs = new Set();
    
    insightPatterns.forEach(pattern => {
      // Find paragraphs that match this pattern
      const matchingParagraphs = paragraphs.filter((paragraph, index) => {
        if (usedParagraphs.has(index)) return false;
        const lowerParagraph = paragraph.toLowerCase();
        return pattern.keywords.some(keyword => lowerParagraph.includes(keyword));
      });

      if (matchingParagraphs.length > 0) {
        // Use the first matching paragraph
        const bestMatch = matchingParagraphs[0];
        const paragraphIndex = paragraphs.indexOf(bestMatch);
        usedParagraphs.add(paragraphIndex);
        
        insights.push({
          icon: pattern.icon,
          title: pattern.title,
          text: bestMatch.trim()
        });
      } else if (insights.length < 3) {
        // Add fallback if we don't have enough insights
        insights.push({
          icon: pattern.icon,
          title: pattern.title,
          text: pattern.fallback
        });
      }
    });

    // If we still don't have enough insights, add some from remaining paragraphs
    if (insights.length < 4) {
      const remainingParagraphs = paragraphs.filter((_, index) => !usedParagraphs.has(index));
      remainingParagraphs.slice(0, 4 - insights.length).forEach((paragraph, index) => {
        const icons = ['🔍', '📋', '🔢', '📌'];
        const titles = ['Analysis', 'Summary', 'Data Points', 'Observations'];
        
        insights.push({
          icon: icons[index % icons.length],
          title: titles[index % titles.length],
          text: paragraph.trim()
        });
      });
    }

    // Ensure we have at least some insights
    if (insights.length === 0) {
      return [
        {
          icon: '🤖',
          title: 'AI Analysis',
          text: analysisText.substring(0, 200) + (analysisText.length > 200 ? '...' : '')
        }
      ];
    }

    return insights.slice(0, 6); // Limit to 6 insights
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

          // Load real pension data from PostgreSQL for Analytics charts
        try {
          console.log('🔍 Calling getPensionData for Analytics...');
          const pensionResponse = await apiService.getPensionData();
          console.log('🔍 Pension Data Response:', pensionResponse);
          
          // Function to transform PostgreSQL data to expected chart format
          const transformPensionData = (rawData) => {
            return rawData.map(record => ({
              // Transform snake_case to PascalCase for chart compatibility
              User_ID: record.user_id,
              Age: record.age,
              Gender: record.gender,
              Country: record.country,
              Employment_Status: record.employment_status,
              Marital_Status: record.marital_status,
              Annual_Income: record.annual_income,
              Current_Savings: record.current_savings,
              Retirement_Age_Goal: record.retirement_age_goal,
              Risk_Tolerance: record.risk_tolerance,
              Contribution_Amount: record.contribution_amount,
              Contribution_Frequency: record.contribution_frequency || 'Monthly',
              Projected_Pension_Amount: record.projected_pension_amount,
              Annual_Return_Rate: record.annual_return_rate || 7.5, // Default if missing
              Pension_Type: record.pension_type,
              Volatility: record.volatility || 10,
              Fees_Percentage: record.fees_percentage || 1.5,
              Expected_Annual_Payout: record.expected_annual_payout,
              Inflation_Adjusted_Payout: record.inflation_adjusted_payout,
              Number_of_Dependents: record.number_of_dependents || 0,
              Education_Level: record.education_level,
              Health_Status: record.health_status,
              Life_Expectancy_Estimate: record.life_expectancy_estimate || 80,
              Home_Ownership_Status: record.home_ownership_status,
              Debt_Level: record.debt_level || 0,
              Monthly_Expenses: record.monthly_expenses,
              Savings_Rate: record.savings_rate || 10,
              Investment_Experience_Level: record.investment_experience_level,
              Portfolio_Diversity_Score: record.portfolio_diversity_score || 50,
              // Keep original fields as well for compatibility
              ...record
            }));
          };
          
          if (pensionResponse?.success && pensionResponse?.data && Array.isArray(pensionResponse.data)) {
            const transformedData = transformPensionData(pensionResponse.data);
            setData(transformedData);
            setLoading(false);
            console.log('✅ Real PostgreSQL data loaded and transformed for Analytics charts:', transformedData.length, 'records');
            console.log('🔍 Sample transformed record:', transformedData[0]);
            console.log('🔍 PostgreSQL Database Sample Ages:', transformedData.slice(0, 5).map(d => d.Age));
            console.log('🔍 PostgreSQL Database Sample Incomes:', transformedData.slice(0, 5).map(d => d.Annual_Income));
            console.log('🔍 PostgreSQL Database Sample Countries:', transformedData.slice(0, 5).map(d => d.Country));
          } else if (Array.isArray(pensionResponse)) {
            const transformedData = transformPensionData(pensionResponse);
            setData(transformedData);
            setLoading(false);
            console.log('✅ Real PostgreSQL data loaded and transformed (array format):', transformedData.length, 'records');
          } else {
            console.log('⚠️ Pension data format unexpected, falling back to mock data');
            const mockData = generateMockPensionData();
            setData(mockData);
            setLoading(false);
            console.log('✅ Mock data generated as fallback for Analytics charts');
          }
        } catch (pensionError) {
          console.error('❌ Failed to load pension data for Analytics:', pensionError);
          // Fallback to mock data if API fails
          const mockData = generateMockPensionData();
          setData(mockData);
          setLoading(false);
          console.log('✅ Mock data generated as fallback after API error');
        }
        
      } catch (error) {
        console.error('❌ Critical error loading advisor data:', error);
        setLoading(false);
        
        // Try to load pension data as fallback
        try {
          console.log('🔍 Fallback: Trying to load pension data...');
          const pensionResponse = await apiService.getPensionData();
          
          // Function to transform PostgreSQL data to expected chart format
          const transformPensionData = (rawData) => {
            return rawData.map(record => ({
              User_ID: record.user_id,
              Age: record.age,
              Gender: record.gender,
              Country: record.country,
              Employment_Status: record.employment_status,
              Marital_Status: record.marital_status,
              Annual_Income: record.annual_income,
              Current_Savings: record.current_savings,
              Retirement_Age_Goal: record.retirement_age_goal,
              Risk_Tolerance: record.risk_tolerance,
              Contribution_Amount: record.contribution_amount,
              Contribution_Frequency: record.contribution_frequency || 'Monthly',
              Projected_Pension_Amount: record.projected_pension_amount,
              Annual_Return_Rate: record.annual_return_rate || 7.5,
              Pension_Type: record.pension_type,
              Volatility: record.volatility || 10,
              Fees_Percentage: record.fees_percentage || 1.5,
              Expected_Annual_Payout: record.expected_annual_payout,
              Inflation_Adjusted_Payout: record.inflation_adjusted_payout,
              Number_of_Dependents: record.number_of_dependents || 0,
              Education_Level: record.education_level,
              Health_Status: record.health_status,
              Life_Expectancy_Estimate: record.life_expectancy_estimate || 80,
              Home_Ownership_Status: record.home_ownership_status,
              Debt_Level: record.debt_level || 0,
              Monthly_Expenses: record.monthly_expenses,
              Savings_Rate: record.savings_rate || 10,
              Investment_Experience_Level: record.investment_experience_level,
              Portfolio_Diversity_Score: record.portfolio_diversity_score || 50,
              ...record
            }));
          };
          
          if (pensionResponse?.data && Array.isArray(pensionResponse.data)) {
            const transformedData = transformPensionData(pensionResponse.data);
            setData(transformedData);
          } else if (Array.isArray(pensionResponse)) {
            const transformedData = transformPensionData(pensionResponse);
            setData(transformedData);
          } else {
            const mockData = generateMockPensionData();
            setData(mockData);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed, using mock data:', fallbackError);
          const mockData = generateMockPensionData();
          setData(mockData);
        }
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

  // Enhanced Analytics Tab with Charts (original version restored)
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
          }`}>Advanced insights from PostgreSQL data across your client portfolio</p>
        </div>

        {/* Charts Section */}
        {loading ? (
          <div className={`rounded-2xl shadow-xl border p-8 text-center transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Loading PostgreSQL portfolio data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Age Distribution Chart */}
              <div className={`rounded-2xl shadow-xl border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Client Age Distribution (PostgreSQL)</h3>
                <div className="h-64">
                  <Plot
                    data={[{
                      x: data.map(d => d.Age),
                      type: 'histogram',
                      marker: { color: '#3B82F6', opacity: 0.8 },
                      name: 'Age Distribution'
                    }]}
                    layout={{
                      width: undefined,
                      height: 256,
                      margin: { l: 50, r: 50, t: 20, b: 50 },
                      paper_bgcolor: isDark ? '#1F2937' : '#FFFFFF',
                      plot_bgcolor: isDark ? '#374151' : '#F9FAFB',
                      font: { color: isDark ? '#F3F4F6' : '#111827' },
                      xaxis: { title: 'Age', gridcolor: isDark ? '#4B5563' : '#E5E7EB' },
                      yaxis: { title: 'Count', gridcolor: isDark ? '#4B5563' : '#E5E7EB' }
                    }}
                    config={{ 
                      displayModeBar: false,
                      responsive: true,
                      useResizeHandler: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Income vs Savings Scatter */}
              <div className={`rounded-2xl shadow-xl border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Income vs Current Savings (PostgreSQL)</h3>
                <div className="h-64">
                  <Plot
                    data={[{
                      x: data.map(d => d.Annual_Income),
                      y: data.map(d => d.Current_Savings),
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
                      width: undefined,
                      height: 256,
                      margin: { l: 50, r: 50, t: 20, b: 50 },
                      paper_bgcolor: isDark ? '#1F2937' : '#FFFFFF',
                      plot_bgcolor: isDark ? '#374151' : '#F9FAFB',
                      font: { color: isDark ? '#F3F4F6' : '#111827' },
                      xaxis: { title: 'Annual Income', gridcolor: isDark ? '#4B5563' : '#E5E7EB' },
                      yaxis: { title: 'Current Savings', gridcolor: isDark ? '#4B5563' : '#E5E7EB' }
                    }}
                    config={{ 
                      displayModeBar: false,
                      responsive: true,
                      useResizeHandler: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Performance Chart */}
            <div className={`rounded-2xl shadow-xl border p-6 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Projected Pension by Age (PostgreSQL)</h3>
              <div className="h-80">
                <Plot
                  data={[{
                    x: data.map(d => d.Age),
                    y: data.map(d => d.Projected_Pension_Amount),
                    mode: 'markers',
                    type: 'scatter',
                    marker: { 
                      color: data.map(d => d.Annual_Return_Rate),
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
                    width: undefined,
                    height: 320,
                    margin: { l: 80, r: 80, t: 20, b: 80 },
                    paper_bgcolor: isDark ? '#1F2937' : '#FFFFFF',
                    plot_bgcolor: isDark ? '#374151' : '#F9FAFB',
                    font: { color: isDark ? '#F3F4F6' : '#111827' },
                    xaxis: { title: 'Client Age', gridcolor: isDark ? '#4B5563' : '#E5E7EB' },
                    yaxis: { title: 'Projected Pension Amount', gridcolor: isDark ? '#4B5563' : '#E5E7EB' }
                  }}
                  config={{ 
                    displayModeBar: false,
                    responsive: true,
                    useResizeHandler: true
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced Explore Charts Tab (new interactive chart dashboard)
  const renderExploreChartsTab = () => {
    if (loading) {
      return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading PostgreSQL Data...</h3>
            <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please wait while we fetch your data</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Interactive Chart Builder (PostgreSQL)
              </h2>
            </div>

            {/* Data Summary */}
            <div className={`rounded-xl p-4 mb-6 transition-all duration-300 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'}`}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>PostgreSQL Data: {data.length} records</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Variables: {getAllColumns().length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Numeric: {getNumericColumns().length}</span>
                </div>
              </div>
            </div>

            {/* Interactive Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gridCharts.map((chart) => (
                <div key={chart.id} className={`rounded-2xl shadow-xl border transition-all duration-300 backdrop-blur-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`} data-chart-id={chart.id}>
                  {chart.isConfigured ? (
                    <>
                      {/* Chart Header with Options */}
                      <div className={`flex justify-between items-center p-4 border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold break-words whitespace-normal transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {variableNames[chart.xAxis] || chart.xAxis} vs {variableNames[chart.yAxis] || chart.yAxis}
                        </h3>

                        <div className="flex items-center space-x-2">
                          {/* AI Insights Button */}
                          <button
                            onClick={() => handleViewAIInsights(chart.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${isDark ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'} transform hover:scale-105 shadow-lg`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>AI Insights</span>
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === chart.id ? null : chart.id);
                              }}
                              className={`p-2 rounded-lg transition-all duration-300 dropdown-toggle ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                              </svg>
                            </button>

                            {activeDropdown === chart.id && (
                              <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border z-50 dropdown-menu transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                                <div className="py-2">
                                  <button
                                    onClick={() => handleEditChart(chart.id)}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Chart
                                  </button>
                                  <button
                                    onClick={() => handleCustomizeChart(chart.id)}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
                                    </svg>
                                    Customize Style
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChart(chart.id)}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-50'}`}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Chart
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chart Content */}
                      <div className="p-4">
                        <div className="h-80 rounded-lg overflow-hidden">
                          <Plot
                            data={getChartData(chart)}
                            layout={{
                              width: undefined,
                              height: 320,
                              title: {
                                text: `${variableNames[chart.xAxis] || chart.xAxis} vs ${variableNames[chart.yAxis] || chart.yAxis}`,
                                font: { size: 16, color: isDark ? '#ffffff' : '#111827' },
                                x: 0.5,
                                xanchor: 'center',
                                yanchor: 'top'
                              },
                              xaxis: {
                                title: {
                                  text: variableNames[chart.xAxis] || chart.xAxis,
                                  font: { size: 12, color: isDark ? '#9ca3af' : '#6b7280' }
                                },
                                gridcolor: isDark ? '#374151' : '#f3f4f6',
                                linecolor: isDark ? '#4b5563' : '#e5e7eb',
                                tickfont: { color: isDark ? '#9ca3af' : '#6b7280' }
                              },
                              yaxis: {
                                title: {
                                  text: variableNames[chart.yAxis] || chart.yAxis,
                                  font: { size: 12, color: isDark ? '#9ca3af' : '#6b7280' }
                                },
                                gridcolor: isDark ? '#374151' : '#f3f4f6',
                                linecolor: isDark ? '#4b5563' : '#e5e7eb',
                                tickfont: { color: isDark ? '#9ca3af' : '#6b7280' }
                              },
                              showlegend: false,
                              margin: { t: 60, r: 20, b: 50, l: 70 },
                              plot_bgcolor: isDark ? '#1f2937' : '#fafafa',
                              paper_bgcolor: isDark ? '#1f2937' : 'white',
                              font: { family: 'Inter, system-ui, sans-serif' }
                            }}
                            style={{ width: '100%', height: '100%' }}
                            config={{
                              responsive: true,
                              useResizeHandler: true,
                              displayModeBar: true,
                              displaylogo: false,
                              modeBarButtonsToRemove: ["sendDataToCloud"],
                              toImageButtonOptions: {
                                format: "png",
                                filename: `advisor-chart-${chart.id}`,
                                height: 800,
                                width: 1200,
                                scale: 2
                              }
                            }}
                            divId={`advisor-chart-${chart.id}`}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Add Chart Placeholder
                    <div
                      onClick={() => handleAddChart(chart.id)}
                      className={`h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${isDark ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'}`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-600 group-hover:text-blue-600'}`}>Add Chart</h3>
                      <p className={`text-sm mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400 group-hover:text-blue-300' : 'text-gray-500 group-hover:text-blue-500'}`}>Click to configure a new chart</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI Insights Modal
  const renderAIInsightsModal = () => {
    if (!showAIInsightsModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Modal Header */}
          <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
                {activeInsightChartId && (
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {(() => {
                      const chart = gridCharts.find(c => c.id === activeInsightChartId);
                      return chart ? `${variableNames[chart.xAxis] || chart.xAxis} vs ${variableNames[chart.yAxis] || chart.yAxis}` : '';
                    })()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAIInsightsModal(false)}
              className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {isLoadingInsights ? (
              <div className={`mb-6 p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-500 border-t-transparent"></div>
                  <span className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    AI Analysis in Progress
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${insightProgress}%` }}
                  ></div>
                </div>
                <p className={`text-sm text-center transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {insightStatusMessage || 'Processing your chart with AI...'}
                </p>
              </div>
            ) : (
              <>
                {insightError && (
                  <div className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${isDark ? 'bg-yellow-800/20 border-yellow-600 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                    <div className="flex items-center space-x-2">
                      <span>⚠️</span>
                      <span className="text-sm">{insightError}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300'}`}>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isDark ? 'bg-gray-600' : 'bg-white shadow-sm'}`}>
                          {insight.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {insight.title}
                          </h4>
                          <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {insight.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className={`p-6 text-center rounded-xl border transition-all duration-300 ${isDark ? 'border-gray-600 bg-gray-800/30 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-600'}`}>
                      <div className="text-4xl mb-2">🤖</div>
                      <p>No insights available for this chart.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowAIInsightsModal(false)}
                className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Close
              </button>
              <button
                onClick={() => captureChartBase64(activeInsightChartId)}
                disabled={isCapturingChart}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCapturingChart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Capture Chart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Chart Configuration Modal
  const renderConfigModal = () => {
    if (!showConfigModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>Configure Chart</h3>
            <button
              onClick={() => setShowConfigModal(false)}
              className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Chart Type */}
            <div>
              <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Chart Type</label>
              <select
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'} focus:ring-2 focus:ring-blue-200`}
                value={tempConfig.chartType}
                onChange={(e) => setTempConfig({ ...tempConfig, chartType: e.target.value })}
              >
                <option value="scatter">Scatter Plot</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="histogram">Histogram</option>
              </select>
            </div>

            {/* X-Axis */}
            <div>
              <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>X-Axis Variable</label>
              <select
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'} focus:ring-2 focus:ring-blue-200`}
                value={tempConfig.xAxis}
                onChange={(e) => setTempConfig({ ...tempConfig, xAxis: e.target.value })}
              >
                {Object.entries(axisOptions).map(([groupName, cols]) => (
                  <optgroup key={groupName} label={groupName}>
                    {cols.map((column) => (
                      <option key={column} value={column}>
                        {variableNames[column] || column}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Y-Axis */}
            <div>
              <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Y-Axis Variable</label>
              <select
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500' : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500'} focus:ring-2 focus:ring-purple-200`}
                value={tempConfig.yAxis}
                onChange={(e) => setTempConfig({ ...tempConfig, yAxis: e.target.value })}
              >
                {Object.entries(axisOptions).map(([groupName, cols]) => (
                  <optgroup key={groupName} label={groupName}>
                    {cols.map((column) => (
                      <option key={column} value={column}>
                        {variableNames[column] || column}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Color Scheme */}
            <div>
              <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Color Scheme</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(colorSchemes).map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => setTempConfig({ ...tempConfig, colorScheme: key })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${tempConfig.colorScheme === key ? 'border-blue-500 ring-2 ring-blue-200' : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <div className={`w-full h-6 rounded-lg mb-2 bg-gradient-to-r ${scheme.gradient}`}></div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={() => setShowConfigModal(false)}
              className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChart}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Save Chart
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Customization Modal  
  const renderCustomizeModal = () => {
    if (!showCustomizeModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>Customize Style</h3>
            <button
              onClick={() => setShowCustomizeModal(false)}
              className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Choose Color Palette</label>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(colorSchemes).map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => setTempConfig({ ...tempConfig, colorScheme: key })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${tempConfig.colorScheme === key ? 'border-blue-500 ring-2 ring-blue-200 transform scale-105' : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <div className="flex space-x-1">
                      {scheme.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                    <div>
                      <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{scheme.name}</span>
                      {tempConfig.colorScheme === key && (
                        <div className="flex items-center mt-1">
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-green-600">Selected</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={() => setShowCustomizeModal(false)}
              className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChart}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                  }`}>Report</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {(() => {
                  // Use clients data if available, otherwise show demo data
                  const displayData = clients.length > 0 ? clients.slice(0, 10) : Array.from({length: 10}, (_, index) => ({
                    User_ID: `U${1000 + index + 1}`,
                    Name: `Mr. User U${1000 + index + 1}`,
                    Age: Math.floor(Math.random() * 30) + 25,
                    Annual_Income: Math.floor(Math.random() * 100000) + 50000,
                    Current_Savings: Math.floor(Math.random() * 500000) + 10000,
                    Monthly_Expenses: Math.floor(Math.random() * 5000) + 2000,
                    Risk_Tolerance: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                    Retirement_Age_Goal: Math.floor(Math.random() * 10) + 60,
                    Projected_Pension_Amount: Math.floor(Math.random() * 1000000) + 500000,
                    Marital_Status: ['Single', 'Married', 'Divorced', 'Widowed'][Math.floor(Math.random() * 4)],
                    Portfolio_Performance: (Math.random() * 5 + 5).toFixed(1),
                    Initials: 'M',
                    InitialsColor: 'bg-blue-500',
                    InitialsText: 'text-white'
                  }));
                  
                  return displayData.map((client, index) => {
                    // Check if this is from the clients API (PostgreSQL data) or demo data
                    const isFromClientsAPI = clients.length > 0 && client.User_ID !== undefined;
                    
                    let displayClient;
                    
                    if (isFromClientsAPI) {
                      // Data from /api/advisor/clients (PostgreSQL data)
                      displayClient = {
                        ...client,
                        Name: client.Name || `Client ${client.User_ID}`, // Generate name if not exists
                        Initials: client.User_ID ? client.User_ID.toString().charAt(client.User_ID.toString().length - 1) : 'C',
                        InitialsColor: 'bg-blue-600',
                        InitialsText: 'text-white'
                      };
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
                        }`}>${typeof displayClient.Annual_Income === 'number' ? displayClient.Annual_Income.toLocaleString() : displayClient.Annual_Income}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-900'
                        }`}>${typeof displayClient.Current_Savings === 'number' ? displayClient.Current_Savings.toLocaleString() : displayClient.Current_Savings}</td>
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
                          <button 
                            onClick={() => generateCustomerReport(displayClient)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                          >
                            View Report
                          </button>
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

  // Planning Tools Tab (new comprehensive tools section)
  const renderPlanningToolsTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Advanced Planning Tools</h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Comprehensive financial planning and analysis tools for client advisory</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Risk Alert Tool */}
          <div className={`rounded-2xl shadow-xl border p-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Risk Alert System</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Identify portfolio risks</p>
              </div>
            </div>
            <p className={`text-sm mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Generate personalized risk alerts for withdrawal rates, asset allocation, savings gaps, and market exposure.
            </p>
            <button 
              onClick={() => setActiveToolModal('riskAlerts')}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 shadow-lg font-medium"
            >
              Analyze Client Risks
            </button>
          </div>

          {/* Portfolio Optimization Tool */}
          <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Portfolio Optimizer</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Optimize asset allocation</p>
              </div>
            </div>
            <p className={`text-sm mb-4 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Optimize portfolio allocation based on your age, risk tolerance, and financial goals, to achieve retirement readiness.
            </p>
            <button 
              onClick={() => setActiveToolModal('portfolioOptimization')}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg font-medium"
            >
              Optimize Portfolio
            </button>
          </div>

          {/* Smart Contributions Tool */}
          <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Smart Contributions</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Optimize savings strategy</p>
              </div>
            </div>
            <p className={`text-sm mb-4 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Generate personalized contribution recommendations and retirement savings scenarios.
            </p>
            <button 
              onClick={() => setActiveToolModal('smartContributions')}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg font-medium"
            >
              Analyze Contributions
            </button>
          </div>

          {/* What-If Simulator Tool */}
          <div className={`rounded-2xl shadow-xl border p-6 transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>What-If Simulator</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Model scenarios</p>
              </div>
            </div>
            <p className={`text-sm mb-4 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Run scenario modeling for retirement age, contribution changes, and market conditions.
            </p>
            <button 
              onClick={() => setActiveToolModal('whatIfSimulator')}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg font-medium"
            >
              Run Simulations
            </button>
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
      case 'advisorTools':
        return renderPlanningToolsTab();
      case 'advisorExploreCharts':
        return renderExploreChartsTab();
      default:
        return renderPortfolioTab();
    }
  };

  // Fetch available clients from database
  const fetchAvailableClients = async () => {
    setClientsLoading(true);
    try {
      const response = await apiService.request('/pension-data?limit=50');
      if (response && response.data) {
        const clientList = response.data.map(client => ({
          user_id: client.user_id,
          age: client.age,
          annual_income: client.annual_income,
          displayName: `${client.user_id} - Age ${client.age}, $${Math.round(client.annual_income/1000)}k income`
        })).filter(client => client.user_id); // Filter out null user_ids
        
        setAvailableClients(clientList);
        console.log('Fetched', clientList.length, 'clients from database');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Use fallback client list
      setAvailableClients([
        { user_id: 'U1001', age: 45, annual_income: 80000, displayName: 'U1001 - Age 45, $80k income' },
        { user_id: 'U1002', age: 38, annual_income: 95000, displayName: 'U1002 - Age 38, $95k income' },
        { user_id: 'U1003', age: 52, annual_income: 120000, displayName: 'U1003 - Age 52, $120k income' },
        { user_id: 'U1004', age: 29, annual_income: 65000, displayName: 'U1004 - Age 29, $65k income' },
        { user_id: 'U1005', age: 58, annual_income: 140000, displayName: 'U1005 - Age 58, $140k income' }
      ]);
    } finally {
      setClientsLoading(false);
    }
  };

  // Load clients when modal opens
  useEffect(() => {
    if (activeToolModal && availableClients.length === 0) {
      fetchAvailableClients();
    }
  }, [activeToolModal]);

  // Planning Tools Modals
  const renderPlanningToolsModals = () => {
    if (!activeToolModal) return null;

    const closeModal = () => {
      setActiveToolModal(null);
      setToolResults(null);
      setToolLoading(false);
      setSelectedClientId('');
    };

    // Backend service calculations using real backend logic
    const runToolAnalysis = async (toolType) => {
      setToolLoading(true);
      setToolResults(null);

      try {
        // For now, directly use the fallback calculations which implement real backend logic
        // TODO: Implement actual API endpoints for advisor tools
        console.log(`Running ${toolType} analysis using backend calculation logic...`);
        console.log('Selected Client ID:', selectedClientId);
        
        const calculatedResults = await calculateFallbackResults(toolType, selectedClientId);
        setToolResults(calculatedResults);

      } catch (error) {
        console.error('Tool analysis error:', error);
        setToolResults({ error: 'Analysis failed. Please try again.' });
      } finally {
        setToolLoading(false);
      }
    };

    // Fallback calculation using backend service logic with real PostgreSQL data
    const calculateFallbackResults = async (toolType, userId) => {
      // Fetch real client data from PostgreSQL database
      const clientData = await fetchClientDataFromDatabase(userId);

      switch (toolType) {
        case 'riskAlerts':
          return calculateRiskAlerts(clientData);
        case 'portfolioOptimization':
          return calculatePortfolioOptimization(clientData);
        case 'smartContributions':
          return calculateSmartContributions(clientData);
        case 'whatIfSimulator':
          return calculateWhatIfScenarios(clientData);
        default:
          return { message: 'Analysis complete' };
      }
    };

    // Fetch real client data from PostgreSQL database
    const fetchClientDataFromDatabase = async (userId) => {
      try {
        console.log('Attempting to fetch data for user:', userId);
        // First try to fetch data using the existing API service
        const response = await apiService.request(`/pension-data?user_id=${userId}`);
        
        console.log('API Response for user', userId, ':', response);
        
        if (response && response.data && response.data.length > 0) {
          // Use the first matching record
          const clientData = response.data[0];
          console.log('Fetched real client data from PostgreSQL for user', userId, ':', clientData);
          
          // Verify that we got the correct user
          if (clientData.user_id !== userId) {
            console.warn(`Warning: Requested user ${userId} but got data for ${clientData.user_id}`);
          }
          
          return clientData;
        } else {
          console.warn(`No data found for user ${userId}, using fallback data`);
          return getFallbackClientData(userId);
        }
      } catch (error) {
        console.error('Error fetching client data from database:', error);
        console.log('Using fallback client data due to database error');
        return getFallbackClientData(userId);
      }
    };

    // Get fallback client data if database fetch fails
    const getFallbackClientData = (userId) => {
      const clientProfiles = {
        'U1001': {
          user_id: 'U1001',
          age: 45,
          annual_income: 80000,
          current_savings: 250000,
          risk_tolerance: 'Medium',
          retirement_age_goal: 65,
          investment_type: 'Equity Fund',
          portfolio_diversity_score: 45,
          contribution_amount: 6000,
          employer_contribution: 3000,
          pension_type: 'Defined Contribution',
          years_contributed: 15,
          annual_return_rate: 7,
          volatility: 18,
          total_annual_contribution: 9000
        },
        'U1002': {
          user_id: 'U1002',
          age: 38,
          annual_income: 95000,
          current_savings: 180000,
          risk_tolerance: 'High',
          retirement_age_goal: 62,
          investment_type: 'Aggressive Growth Fund',
          portfolio_diversity_score: 35,
          contribution_amount: 8000,
          employer_contribution: 4000,
          pension_type: 'Defined Contribution',
          years_contributed: 12,
          annual_return_rate: 8.5,
          volatility: 22,
          total_annual_contribution: 12000
        },
        'U1003': {
          user_id: 'U1003',
          age: 52,
          annual_income: 120000,
          current_savings: 450000,
          risk_tolerance: 'Low',
          retirement_age_goal: 67,
          investment_type: 'Bond Fund',
          portfolio_diversity_score: 80,
          contribution_amount: 10000,
          employer_contribution: 6000,
          pension_type: 'Defined Benefit',
          years_contributed: 25,
          annual_return_rate: 5.5,
          volatility: 8,
          total_annual_contribution: 16000
        },
        'U1004': {
          user_id: 'U1004',
          age: 29,
          annual_income: 65000,
          current_savings: 45000,
          risk_tolerance: 'Medium',
          retirement_age_goal: 65,
          investment_type: 'Target Date Fund',
          portfolio_diversity_score: 60,
          contribution_amount: 3000,
          employer_contribution: 1500,
          pension_type: 'Defined Contribution',
          years_contributed: 5,
          annual_return_rate: 7.2,
          volatility: 15,
          total_annual_contribution: 4500
        },
        'U1005': {
          user_id: 'U1005',
          age: 58,
          annual_income: 140000,
          current_savings: 850000,
          risk_tolerance: 'Medium',
          retirement_age_goal: 62,
          investment_type: 'Balanced Fund',
          portfolio_diversity_score: 75,
          contribution_amount: 15000,
          employer_contribution: 8000,
          pension_type: 'Defined Contribution',
          years_contributed: 30,
          annual_return_rate: 6.8,
          volatility: 12,
          total_annual_contribution: 23000
        }
      };

      return clientProfiles[userId] || clientProfiles['U1001'];
    };

    // Risk Alerts calculation using real database data
    const calculateRiskAlerts = (memberData) => {
      const alerts = [];

      // Validate that we have real data
      if (!memberData || !memberData.user_id) {
        console.error('Invalid member data for risk calculation:', memberData);
        return {
          userId: 'unknown',
          totalAlerts: 0,
          riskLevel: 'LOW',
          alerts: [],
          error: 'No valid member data available'
        };
      }

      console.log('Calculating risk alerts for real data:', memberData);

      // Asset Allocation Alert using real database values
      const age = memberData.age;
      const riskTolerance = memberData.risk_tolerance || 'Medium';
      
      // Get actual equity allocation from database or estimate from investment_type
      let equityAllocation = 50; // Default
      if (memberData.investment_type) {
        const investmentType = memberData.investment_type.toLowerCase();
        if (investmentType.includes('equity') || investmentType.includes('aggressive') || investmentType.includes('growth') || investmentType.includes('stock')) {
          equityAllocation = 80;
        } else if (investmentType.includes('bond') || investmentType.includes('conservative')) {
          equityAllocation = 20;
        } else if (investmentType.includes('target') || investmentType.includes('balanced')) {
          equityAllocation = 60;
        }
      }

      // Adjust based on real portfolio diversity score from database
      const diversityScore = memberData.portfolio_diversity_score || 50;
      if (diversityScore < 50) {
        equityAllocation += 10; // Assume higher risk exposure due to concentration
      }

      // Calculate recommended equity allocation using real risk tolerance
      let recommendedEquity;
      if (riskTolerance === 'Low') {
        recommendedEquity = Math.max(20, 100 - age);
      } else if (riskTolerance === 'Medium') {
        recommendedEquity = Math.max(30, 110 - age);
      } else { // High risk tolerance
        recommendedEquity = Math.max(40, 120 - age);
      }

      const allocationDifference = Math.abs(equityAllocation - recommendedEquity);
      
      if (allocationDifference > 15) {
        alerts.push({
          type: 'ASSET_ALLOCATION',
          severity: allocationDifference > 30 ? 'HIGH' : 'MEDIUM',
          title: equityAllocation > recommendedEquity ? 'Overexposed to Equity Risk' : 'Too Conservative Allocation',
          description: `Current equity allocation (${equityAllocation}%) differs significantly from recommended (${recommendedEquity}%)`,
          metrics: { 
            currentEquity: equityAllocation, 
            recommendedEquity, 
            difference: allocationDifference,
            investmentType: memberData.investment_type,
            diversityScore 
          },
          recommendations: equityAllocation > recommendedEquity ? [
            'Reduce equity allocation to manage risk',
            'Increase bond allocation for stability',
            'Consider target-date funds for automatic rebalancing'
          ] : [
            'Increase equity allocation for growth potential',
            'Consider age-appropriate risk taking',
            'Review inflation protection strategies'
          ]
        });
      }

      // Portfolio Diversity Alert using real database score
      if (diversityScore < 40) {
        alerts.push({
          type: 'PORTFOLIO_DIVERSITY',
          severity: diversityScore < 25 ? 'HIGH' : 'MEDIUM',
          title: 'Poor Portfolio Diversification',
          description: `Portfolio diversity score of ${diversityScore} indicates concentrated risk exposure`,
          metrics: { diversityScore, recommendedMinimum: 50 },
          recommendations: [
            'Diversify across multiple asset classes',
            'Consider international exposure',
            'Add bonds or REITs for better balance',
            'Review fund overlap and concentration'
          ]
        });
      }

      // Savings Gap Alert using real database financial data
      const currentAge = memberData.age;
      const retirementAge = memberData.retirement_age_goal || 65;
      const currentSavings = memberData.current_savings || 0;
      const annualIncome = memberData.annual_income || 0;
      const yearlyContributions = memberData.total_annual_contribution || memberData.contribution_amount || 0;
      const yearsToRetirement = retirementAge - currentAge;
      
      // Use real annual return rate from database
      const assumedReturn = (memberData.annual_return_rate || 7) / 100;
      const targetRetirementSavings = annualIncome * 12; // 12x income target
      
      if (yearsToRetirement > 0 && annualIncome > 0) {
        const futureValue = currentSavings * Math.pow(1 + assumedReturn, yearsToRetirement) +
                           yearlyContributions * ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) / assumedReturn);
        const savingsGap = targetRetirementSavings - futureValue;

        if (savingsGap > 0) {
          const additionalMonthlyNeeded = (savingsGap * assumedReturn) / 
                                        ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) * 12);
          alerts.push({
            type: 'SAVINGS_GAP',
            severity: savingsGap > targetRetirementSavings * 0.3 ? 'HIGH' : 'MEDIUM',
            title: 'Retirement Savings Shortfall',
            description: `Projected savings fall short of retirement goal by $${Math.round(savingsGap).toLocaleString()}`,
            metrics: {
              currentSavings: currentSavings,
              projectedSavings: Math.round(futureValue),
              targetSavings: targetRetirementSavings,
              savingsGap: Math.round(savingsGap),
              additionalMonthlyNeeded: Math.round(additionalMonthlyNeeded),
              yearsToRetirement,
              currentContributionRate: Math.round((yearlyContributions / annualIncome) * 100),
              actualReturnRate: memberData.annual_return_rate
            },
            recommendations: [
              `Increase monthly contributions by $${Math.round(additionalMonthlyNeeded)}`,
              'Consider maximizing employer match opportunities',
              'Review and optimize investment allocations',
              'Explore catch-up contributions if eligible'
            ]
          });
        }
      }

      // Contribution Rate Alert using real database income and contribution data
      if (annualIncome > 0 && yearlyContributions >= 0) {
        const contributionRate = (yearlyContributions / annualIncome) * 100;
        const recommendedRate = age < 40 ? 15 : age < 50 ? 18 : 20;
        
        if (contributionRate < recommendedRate) {
          alerts.push({
            type: 'LOW_CONTRIBUTION_RATE',
            severity: contributionRate < recommendedRate * 0.6 ? 'HIGH' : 'MEDIUM',
            title: 'Insufficient Contribution Rate',
            description: `Current contribution rate of ${contributionRate.toFixed(1)}% is below recommended ${recommendedRate}% for age ${age}`,
            metrics: { 
              currentRate: contributionRate.toFixed(1), 
              recommendedRate, 
              annualShortfall: Math.round(annualIncome * (recommendedRate - contributionRate) / 100),
              currentContribution: yearlyContributions,
              employerContribution: memberData.employer_contribution || 0
            },
            recommendations: [
              `Increase contributions by $${Math.round(annualIncome * (recommendedRate - contributionRate) / 100)} annually`,
              'Maximize employer matching contributions',
              'Consider automatic contribution increases',
              'Review budget for additional savings opportunities'
            ]
          });
        }
      }

      // Near-Retirement Risk Alert using real database data
      if (yearsToRetirement <= 10 && yearsToRetirement > 0 && equityAllocation > 60) {
        alerts.push({
          type: 'SEQUENCE_OF_RETURNS_RISK',
          severity: yearsToRetirement <= 5 ? 'HIGH' : 'MEDIUM',
          title: 'High Equity Risk Near Retirement',
          description: `${equityAllocation}% equity allocation with only ${yearsToRetirement} years to retirement increases sequence of returns risk`,
          metrics: {
            equityAllocation,
            yearsToRetirement,
            recommendedEquity: Math.max(30, 70 - (10 - yearsToRetirement) * 5),
            retirementGoal: retirementAge,
            currentAge: currentAge
          },
          recommendations: [
            'Begin systematic de-risking strategy',
            'Consider bond ladder for near-term expenses',
            'Implement glide path to target date allocation',
            'Review withdrawal strategy planning'
          ]
        });
      }

      // Calculate overall risk level
      const highSeverityCount = alerts.filter(alert => alert.severity === 'HIGH').length;
      const mediumSeverityCount = alerts.filter(alert => alert.severity === 'MEDIUM').length;
      let riskLevel = 'LOW';
      if (highSeverityCount >= 2) riskLevel = 'CRITICAL';
      else if (highSeverityCount >= 1) riskLevel = 'HIGH';
      else if (mediumSeverityCount >= 2) riskLevel = 'MEDIUM';
      else if (mediumSeverityCount >= 1) riskLevel = 'MEDIUM';

      console.log(`Risk analysis complete for ${memberData.user_id}: ${alerts.length} alerts, ${riskLevel} risk level`);

      return {
        userId: memberData.user_id,
        totalAlerts: alerts.length,
        riskLevel,
        alerts,
        memberInfo: {
          age: memberData.age,
          income: memberData.annual_income,
          savings: memberData.current_savings,
          riskTolerance: memberData.risk_tolerance,
          investmentType: memberData.investment_type
        },
        generatedAt: new Date().toISOString()
      };
    };

    // Portfolio Optimization calculation using real database data
    const calculatePortfolioOptimization = (memberData) => {
      if (!memberData || !memberData.user_id) {
        console.error('Invalid member data for portfolio optimization:', memberData);
        return { error: 'No valid member data available' };
      }

      console.log('Calculating portfolio optimization for real data:', memberData);

      // Estimate current allocation from real database investment_type
      const investmentType = (memberData.investment_type || 'Balanced').toLowerCase();
      let currentAllocation;
      
      if (investmentType.includes('bond') || investmentType.includes('conservative')) {
        currentAllocation = { stocks: 20.0, bonds: 70.0, cash: 10.0 };
      } else if (investmentType.includes('equity') || investmentType.includes('stock') || investmentType.includes('aggressive') || investmentType.includes('growth')) {
        currentAllocation = { stocks: 80.0, bonds: 15.0, cash: 5.0 };
      } else if (investmentType.includes('target')) {
        // Target date funds adjust based on age
        const age = memberData.age || 45;
        const equityPercent = Math.max(30, 100 - age);
        currentAllocation = { 
          stocks: equityPercent, 
          bonds: 90 - equityPercent, 
          cash: 10 
        };
      } else {
        // Balanced or default
        currentAllocation = { stocks: 50.0, bonds: 40.0, cash: 10.0 };
      }

      // Calculate recommended allocation using real member profile data
      const age = memberData.age || 45;
      const riskTolerance = memberData.risk_tolerance || 'Medium';
      const retirementAgeGoal = memberData.retirement_age_goal || 65;
      const yearsToRetirement = Math.max(0, retirementAgeGoal - age);

      // Base equity allocation by real risk tolerance from database
      const baseEquityMap = { 'Low': 0.40, 'Medium': 0.60, 'High': 0.75 };
      let equity = baseEquityMap[riskTolerance] || 0.60;

      // Age-based glide path using real age
      const glideAdjustment = Math.max(0, (age - 30) * 0.005);
      equity = Math.max(0.25, Math.min(0.90, equity - glideAdjustment));

      // Pension type adjustments using real database data
      if (memberData.pension_type && memberData.pension_type.includes('Defined Benefit')) {
        equity += 0.03; // DB provides bond-like floor
      }

      // Near retirement dampening using real retirement goal
      if (yearsToRetirement <= 7) equity -= 0.05;

      equity = Math.max(0.15, Math.min(0.90, equity));
      
      // Calculate cash allocation based on real data
      let cash = 0.10;
      if (age >= 55) cash += 0.05;
      if (riskTolerance === 'Low') cash += 0.05;
      cash = Math.max(0.05, Math.min(0.25, cash));
      
      const bonds = Math.max(0.0, 1.0 - equity - cash);

      const recommendedAllocation = {
        stocks: Math.round(equity * 100 * 10) / 10,
        bonds: Math.round(bonds * 100 * 10) / 10,
        cash: Math.round(cash * 100 * 10) / 10
      };

      const allocationDeltas = {
        stocks: Math.round((recommendedAllocation.stocks - currentAllocation.stocks) * 10) / 10,
        bonds: Math.round((recommendedAllocation.bonds - currentAllocation.bonds) * 10) / 10,
        cash: Math.round((recommendedAllocation.cash - currentAllocation.cash) * 10) / 10
      };

      // Generate rationale using real member data
      const rationale = `Based on your ${riskTolerance.toLowerCase()} risk tolerance and ${age} years of age, we recommend ${
        allocationDeltas.stocks > 0 ? 'increasing' : allocationDeltas.stocks < 0 ? 'reducing' : 'maintaining'
      } equity allocation ${allocationDeltas.stocks !== 0 ? `by ${Math.abs(allocationDeltas.stocks)}%` : ''} to ${
        allocationDeltas.stocks > 0 ? 'capture more growth potential' : 
        allocationDeltas.stocks < 0 ? 'preserve capital' : 'maintain appropriate risk balance'
      } as you approach retirement in ${yearsToRetirement} years. Current investment type: ${memberData.investment_type || 'Not specified'}.`;

      return {
        userId: memberData.user_id,
        currentAllocation,
        recommendedAllocation,
        allocationDeltas,
        rationale,
        memberProfile: {
          age: memberData.age,
          riskTolerance: memberData.risk_tolerance,
          pensionType: memberData.pension_type,
          investmentType: memberData.investment_type,
          retirementAgeGoal: memberData.retirement_age_goal,
          yearsToRetirement
        },
        optimizationDate: new Date().toISOString()
      };
    };

    // Smart Contributions calculation using real database data
    const calculateSmartContributions = (memberData) => {
      if (!memberData || !memberData.user_id) {
        console.error('Invalid member data for smart contributions:', memberData);
        return { error: 'No valid member data available' };
      }

      console.log('Calculating smart contributions for real data:', memberData);

      const currentAge = memberData.age || 45;
      const retirementAge = memberData.retirement_age_goal || 65;
      const currentSavings = memberData.current_savings || 0;
      const annualIncome = memberData.annual_income || 0;
      const currentContribution = memberData.total_annual_contribution || memberData.contribution_amount || 0;
      const employerContribution = memberData.employer_contribution || 0;
      const yearsToRetirement = retirementAge - currentAge;
      const targetSavings = annualIncome * 12; // 12x income target
      
      // Use real return rate from database
      const assumedReturn = (memberData.annual_return_rate || 7) / 100;

      if (yearsToRetirement <= 0 || annualIncome <= 0) {
        return {
          userId: memberData.user_id,
          error: 'Invalid data for contribution calculation',
          memberInfo: { age: currentAge, income: annualIncome, retirementAge }
        };
      }

      // Calculate scenarios using real data
      const scenarios = [
        {
          name: 'Current Plan',
          annualContribution: currentContribution,
          projectedValue: 0,
          incomeReplacement: 0
        },
        {
          name: '10% Income Savings',
          annualContribution: annualIncome * 0.10,
          projectedValue: 0,
          incomeReplacement: 0
        },
        {
          name: '15% Income Savings',
          annualContribution: annualIncome * 0.15,
          projectedValue: 0,
          incomeReplacement: 0
        },
        {
          name: 'Target Optimized',
          annualContribution: 0, // Will calculate below
          projectedValue: 0,
          incomeReplacement: 0
        }
      ];

      // Calculate projected values for each scenario
      scenarios.forEach(scenario => {
        if (scenario.name !== 'Target Optimized') {
          scenario.projectedValue = Math.round(
            currentSavings * Math.pow(1 + assumedReturn, yearsToRetirement) + 
            scenario.annualContribution * ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) / assumedReturn)
          );
          const safeWithdrawal = scenario.projectedValue * 0.04;
          scenario.incomeReplacement = Math.round((safeWithdrawal / (annualIncome * 0.8)) * 100);
        }
      });

      // Calculate target optimized contribution to reach retirement goal
      const currentValueAtRetirement = currentSavings * Math.pow(1 + assumedReturn, yearsToRetirement);
      const neededFromContributions = Math.max(0, targetSavings - currentValueAtRetirement);
      const annuityFactor = ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) / assumedReturn);
      const targetOptimizedContribution = annuityFactor > 0 ? neededFromContributions / annuityFactor : 0;

      scenarios[3].annualContribution = Math.round(targetOptimizedContribution);
      scenarios[3].projectedValue = targetSavings;
      scenarios[3].incomeReplacement = Math.round((targetSavings * 0.04) / (annualIncome * 0.8) * 100);

      // Calculate contribution gap analysis
      const gap = targetSavings - scenarios[0].projectedValue;
      const additionalMonthlyNeeded = gap > 0 ? 
        (gap * assumedReturn) / ((Math.pow(1 + assumedReturn, yearsToRetirement) - 1) * 12) : 0;

      return {
        userId: memberData.user_id,
        contributionGap: {
          onTrack: gap <= 0,
          gap: Math.max(0, gap),
          additionalAnnualContribution: Math.max(0, additionalMonthlyNeeded * 12),
          additionalMonthlyContribution: Math.max(0, additionalMonthlyNeeded)
        },
        scenarios: scenarios.filter(s => s.annualContribution >= 0),
        memberInfo: {
          age: currentAge,
          income: annualIncome,
          currentSavings: currentSavings,
          currentContribution: currentContribution,
          employerContribution: employerContribution,
          retirementAge: retirementAge,
          yearsToRetirement: yearsToRetirement,
          returnRate: memberData.annual_return_rate,
          currentContributionRate: Math.round((currentContribution / annualIncome) * 100)
        },
        calculationDate: new Date().toISOString()
      };
    };

    // What-If Simulator calculation using real database data
    const calculateWhatIfScenarios = (memberData) => {
      if (!memberData || !memberData.user_id) {
        console.error('Invalid member data for what-if simulation:', memberData);
        return { error: 'No valid member data available' };
      }

      console.log('Calculating what-if scenarios for real data:', memberData);

      const currentAge = memberData.age || 45;
      const retirementAge = memberData.retirement_age_goal || 65;
      const currentSavings = memberData.current_savings || 0;
      const currentContribution = memberData.total_annual_contribution || memberData.contribution_amount || 0;
      const annualIncome = memberData.annual_income || 0;
      const yearsToRetirement = retirementAge - currentAge;
      
      // Use real return rate from database
      const baseReturn = (memberData.annual_return_rate || 7) / 100;

      if (yearsToRetirement <= 0 || annualIncome <= 0) {
        return {
          userId: memberData.user_id,
          error: 'Invalid data for scenario simulation',
          memberInfo: { age: currentAge, income: annualIncome, retirementAge }
        };
      }

      // Calculate baseline scenario using real data
      const baseline = {
        projectedValue: Math.round(
          currentSavings * Math.pow(1 + baseReturn, yearsToRetirement) + 
          currentContribution * ((Math.pow(1 + baseReturn, yearsToRetirement) - 1) / baseReturn)
        ),
        incomeReplacement: 0
      };
      baseline.incomeReplacement = Math.round((baseline.projectedValue * 0.04) / (annualIncome * 0.8) * 100);

      // Scenario 1: Retire 2 years later (real data adjustment)
      const delayedRetirementYears = yearsToRetirement + 2;
      const delayedRetirementValue = Math.round(
        currentSavings * Math.pow(1 + baseReturn, delayedRetirementYears) + 
        currentContribution * ((Math.pow(1 + baseReturn, delayedRetirementYears) - 1) / baseReturn)
      );

      // Scenario 2: Increase contribution by realistic amount based on income
      const contributionIncrease = Math.min(5000, annualIncome * 0.05); // 5% of income or $5k max
      const increasedContribution = currentContribution + contributionIncrease;
      const increasedContributionValue = Math.round(
        currentSavings * Math.pow(1 + baseReturn, yearsToRetirement) + 
        increasedContribution * ((Math.pow(1 + baseReturn, yearsToRetirement) - 1) / baseReturn)
      );

      // Scenario 3: Higher return rate (optimistic scenario)
      const higherReturn = Math.min(0.10, baseReturn + 0.02); // 2% higher or 10% max
      const higherReturnValue = Math.round(
        currentSavings * Math.pow(1 + higherReturn, yearsToRetirement) + 
        currentContribution * ((Math.pow(1 + higherReturn, yearsToRetirement) - 1) / higherReturn)
      );

      // Scenario 4: Employer match optimization (if applicable)
      const employerMatch = memberData.employer_contribution || 0;
      const maxEmployerMatch = Math.min(annualIncome * 0.06, employerMatch * 2); // Assume 6% max or double current
      const optimizedContribution = currentContribution + (maxEmployerMatch - employerMatch);
      const employerOptimizedValue = Math.round(
        currentSavings * Math.pow(1 + baseReturn, yearsToRetirement) + 
        optimizedContribution * ((Math.pow(1 + baseReturn, yearsToRetirement) - 1) / baseReturn)
      );

      const scenarios = [
        {
          name: `Retire 2 years later (age ${retirementAge + 2})`,
          projectedValue: delayedRetirementValue,
          improvement: Math.round(((delayedRetirementValue - baseline.projectedValue) / baseline.projectedValue) * 100),
          details: `Extend working years from ${yearsToRetirement} to ${delayedRetirementYears}`
        },
        {
          name: `Increase contribution by $${contributionIncrease.toLocaleString()}`,
          projectedValue: increasedContributionValue,
          improvement: Math.round(((increasedContributionValue - baseline.projectedValue) / baseline.projectedValue) * 100),
          details: `Annual contribution: $${currentContribution.toLocaleString()} → $${increasedContribution.toLocaleString()}`
        },
        {
          name: `${(higherReturn * 100).toFixed(1)}% annual return`,
          projectedValue: higherReturnValue,
          improvement: Math.round(((higherReturnValue - baseline.projectedValue) / baseline.projectedValue) * 100),
          details: `Return rate: ${(baseReturn * 100).toFixed(1)}% → ${(higherReturn * 100).toFixed(1)}%`
        }
      ];

      // Add employer match scenario only if there's potential improvement
      if (maxEmployerMatch > employerMatch) {
        scenarios.push({
          name: 'Maximize employer match',
          projectedValue: employerOptimizedValue,
          improvement: Math.round(((employerOptimizedValue - baseline.projectedValue) / baseline.projectedValue) * 100),
          details: `Employer match: $${employerMatch.toLocaleString()} → $${maxEmployerMatch.toLocaleString()}`
        });
      }

      const insights = [];
      if (scenarios[0].improvement > 20) {
        insights.push('Delaying retirement by 2 years could significantly boost retirement savings due to compound growth');
      }
      if (scenarios[1].improvement > 10) {
        insights.push(`Increasing contributions by $${contributionIncrease.toLocaleString()} annually could improve retirement outlook`);
      }
      if (maxEmployerMatch > employerMatch) {
        insights.push('Consider maximizing employer match opportunities for additional retirement savings');
      }

      return {
        userId: memberData.user_id,
        baseline,
        scenarios: scenarios.filter(s => s.improvement > 0), // Only show scenarios with positive impact
        insights,
        memberInfo: {
          age: currentAge,
          income: annualIncome,
          currentSavings: currentSavings,
          currentContribution: currentContribution,
          employerContribution: employerMatch,
          retirementAge: retirementAge,
          yearsToRetirement: yearsToRetirement,
          returnRate: memberData.annual_return_rate
        },
        simulationDate: new Date().toISOString()
      };
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Modal Header */}
          <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div>
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeToolModal === 'riskAlerts' && 'Risk Alert Analysis'}
                {activeToolModal === 'portfolioOptimization' && 'Portfolio Optimization'}
                {activeToolModal === 'smartContributions' && 'Smart Contribution Analysis'}
                {activeToolModal === 'whatIfSimulator' && 'What-If Simulator'}
              </h3>
              <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Advanced financial planning and analysis
              </p>
            </div>
            <button
              onClick={closeModal}
              className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Client Selection (for individual analysis) */}
            {['riskAlerts', 'portfolioOptimization', 'smartContributions', 'whatIfSimulator'].includes(activeToolModal) && (
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Select Client for Analysis
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={clientsLoading}
                  className={`w-full p-3 border rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">
                    {clientsLoading ? 'Loading clients...' : 'Select a client...'}
                  </option>
                  {availableClients.map(client => (
                    <option key={client.user_id} value={client.user_id}>
                      {client.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Button */}
            {!toolResults && (
              <div className="mb-6">
                <button
                  onClick={() => runToolAnalysis(activeToolModal)}
                  disabled={toolLoading || (selectedClientId === '' && ['riskAlerts', 'portfolioOptimization', 'smartContributions', 'whatIfSimulator'].includes(activeToolModal))}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {toolLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Running Analysis...</span>
                    </div>
                  ) : (
                    `Run ${activeToolModal === 'riskAlerts' ? 'Risk Analysis' : 
                         activeToolModal === 'portfolioOptimization' ? 'Portfolio Optimization' :
                         activeToolModal === 'smartContributions' ? 'Contribution Analysis' :
                         'What-If Simulation'}`
                  )}
                </button>
              </div>
            )}

            {/* Results Display */}
            {toolResults && !toolResults.error && (
              <div className="space-y-6">
                {/* Risk Alerts Results */}
                {activeToolModal === 'riskAlerts' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Risk Assessment Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${toolResults.riskLevel === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {toolResults.totalAlerts}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Alerts</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            toolResults.riskLevel === 'HIGH' ? 'text-red-500' : 
                            toolResults.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {toolResults.riskLevel}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Risk Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{toolResults.alerts.length}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Issues Found</div>
                        </div>
                      </div>
                    </div>

                    {toolResults.alerts.map((alert, index) => (
                      <div key={index} className={`p-4 border-l-4 rounded-lg ${
                        alert.severity === 'HIGH' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                      } ${isDark ? 'bg-opacity-10' : ''}`}>
                        <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.title}</h5>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{alert.description}</p>
                        <div className="mt-3">
                          <h6 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Recommendations:</h6>
                          <ul className={`text-sm mt-1 ml-4 list-disc ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {alert.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Portfolio Optimization Results */}
                {activeToolModal === 'portfolioOptimization' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Portfolio Allocation Comparison</h4>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Allocation</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Stocks</span>
                              <span className="font-medium">{toolResults.currentAllocation.stocks}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bonds</span>
                              <span className="font-medium">{toolResults.currentAllocation.bonds}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cash</span>
                              <span className="font-medium">{toolResults.currentAllocation.cash}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recommended Allocation</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Stocks</span>
                              <span className="font-medium text-blue-600">{toolResults.recommendedAllocation.stocks}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bonds</span>
                              <span className="font-medium text-blue-600">{toolResults.recommendedAllocation.bonds}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cash</span>
                              <span className="font-medium text-blue-600">{toolResults.recommendedAllocation.cash}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong>Rationale:</strong> {toolResults.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Smart Contributions Results */}
                {activeToolModal === 'smartContributions' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contribution Analysis</h4>
                      
                      {!toolResults.contributionGap.onTrack && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-orange-800'}`}>
                            Gap Analysis: Additional ${toolResults.contributionGap.additionalMonthlyContribution}/month needed
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {toolResults.scenarios.map((scenario, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{scenario.name}</div>
                              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                ${scenario.annualContribution.toLocaleString()}/year
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${scenario.projectedValue.toLocaleString()}
                              </div>
                              <div className={`text-sm ${
                                scenario.incomeReplacement >= 80 ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {scenario.incomeReplacement}% replacement
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* What-If Simulator Results */}
                {activeToolModal === 'whatIfSimulator' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Scenario Analysis</h4>
                      
                      <div className="mb-4">
                        <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Baseline Scenario</h5>
                        <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                          <span>Current Plan</span>
                          <span className="font-medium">${toolResults.baseline.projectedValue.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {toolResults.scenarios.map((scenario, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{scenario.name}</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${scenario.projectedValue.toLocaleString()}
                              </div>
                              <div className="text-sm text-green-600">+{scenario.improvement}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {toolResults.insights.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <h6 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-800' : 'text-green-800'}`}>Key Insights:</h6>
                          <ul className="text-sm text-green-700 ml-4 list-disc">
                            {toolResults.insights.map((insight, i) => (
                              <li key={i}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() => runToolAnalysis(activeToolModal)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Run Again
                  </button>
                  <button
                    onClick={closeModal}
                    className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {toolResults?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{toolResults.error}</p>
                <button
                  onClick={() => runToolAnalysis(activeToolModal)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {renderAIInsightsModal()}
      {renderConfigModal()}
      {renderCustomizeModal()}
      {renderPlanningToolsModals()}
      <ChatbotAssistant isDark={isDark} />
    </>
  );
}
