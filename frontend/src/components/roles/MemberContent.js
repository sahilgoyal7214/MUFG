'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePensionData, useUserProfile } from '../../lib/hooks';
import { useChatbot } from '../../hooks/useApi';
import DataService from '../../lib/dataService';
import ChatbotService from '../../lib/chatbotService';
import apiService from '../../lib/apiService';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Chart preferences utilities
const saveChartPreferences = (charts) => {
  try {
    localStorage.setItem('member-chart-preferences', JSON.stringify(charts));
  } catch (error) {
    console.warn('Failed to save chart preferences:', error);
  }
};



const loadChartPreferences = () => {
  try {
    const saved = localStorage.getItem('member-chart-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load chart preferences:', error);
  }
  return null;
};

// Generate mock pension data for fallback
const generateMockPensionData = () => {
  const mockData = [];
  for (let i = 0; i < 100; i++) {
    mockData.push({
      user_id: `U${String(i + 1).padStart(3, '0')}`,
      age: 25 + Math.floor(Math.random() * 40),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      country: ['UK', 'US', 'Canada', 'Australia'][Math.floor(Math.random() * 4)],
      annual_income: 30000 + Math.floor(Math.random() * 100000),
      current_savings: Math.floor(Math.random() * 500000),
      contribution_amount: 200 + Math.floor(Math.random() * 1000),
      projected_pension_amount: 100000 + Math.floor(Math.random() * 2000000),
      years_contributed: Math.floor(Math.random() * 30),
      annual_return_rate: (3 + Math.random() * 8).toString(),
      retirement_age_goal: 60 + Math.floor(Math.random() * 10),
      employer_contribution: Math.floor(Math.random() * 500),
      total_annual_contribution: Math.floor(Math.random() * 10000),
      // Keep timeline data for charts if needed
      ProjectionTimeline: Array.from({ length: 10 }, (_, idx) => 2024 + idx),
      Savings: Array.from({ length: 10 }, (_, idx) => 50000 + (idx * 15000) + Math.random() * 10000)
    });
  }
  return mockData;
};

export default function MemberContent({ activeTab, isDark, onToggleDark, currentUserId }) {
  // Use backend data hooks
  const { data: backendData, loading: backendLoading, error: backendError, refetch } = usePensionData();
  const { profile, stats } = useUserProfile();

  // State for loaded data (fallback to mock data if backend fails)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use backend data when available, fallback to mock data
  useEffect(() => {
    if (backendData && backendData.length > 0) {
      setData(backendData);
      setLoading(false);
      setError(null);
    } else if (backendError) {
      // Fallback to mock data if backend fails
      console.warn('Backend data failed, using mock data:', backendError);
      loadMockData();
    } else if (!backendLoading) {
      // Backend returned empty data, use mock data
      console.warn('Backend returned empty data, using mock data');
      loadMockData();
    } else {
      // For immediate rendering during development, load mock data
      loadMockData();
    }
  }, [backendData, backendLoading, backendError]);

  // Mock data loader (existing implementation)
  const loadMockData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateMockPensionData());
      setLoading(false);
      setError(null);
    }, 1000);
  };

  // Chart base64 storage state
  const [chartBase64Data, setChartBase64Data] = useState(null);
  const [isCapturingChart, setIsCapturingChart] = useState(false);
  const [chartCaptureError, setChartCaptureError] = useState(null);

  const [chartConfig, setChartConfig] = useState({
    xAxis: "age",                   // use real backend field
    yAxis: "current_savings",       // use real backend field
    chartType: "scatter",           // scatter plot works better with single data points
    colorScheme: "default",
    showInsights: true
  });

  // State for managing multiple charts in the grid
  const [gridCharts, setGridCharts] = useState(() => {
    const savedCharts = loadChartPreferences();
    if (savedCharts && savedCharts.length > 0) {
      return savedCharts;
    }
    return [
      {
        id: 1,
        xAxis: "age",                 // use real backend field
        yAxis: "current_savings",             // 👈 so it doesn’t collapse to 1 point
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


  // State for chart configuration modal
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
  const [tempConfig, setTempConfig] = useState({
    xAxis: 'age',
    yAxis: 'projected_pension_amount',
    chartType: 'scatter',
    colorScheme: 'default',
    showInsights: true,
    customColors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06d6a0'
    }
  });
  // Curated axis options grouped by category
  const axisOptions = {
    Demographics: ["age", "gender", "years_contributed", "account_age"],
    Financials: ["current_savings", "annual_income", "debt_level", "monthly_expenses"],
    Contributions: ["contribution_amount", "employer_contribution", "total_annual_contribution"],
    Retirement: ["projected_pension_amount", "expected_annual_payout", "inflation_adjusted_payout", "years_of_payout"],
    Portfolio: ["annual_return_rate", "volatility", "fees_percentage", "portfolio_diversity_score"],
    Risk: ["anomaly_score", "transaction_pattern_score"],
  };


  // State for dropdown menus
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  // Variable display names mapping
  const variableNames = {
    user_id: 'User ID',
    age: 'Age (years)',
    gender: 'Gender',
    country: 'Country',
    employment_status: 'Employment Status',
    annual_income: 'Annual Income ($)',
    current_savings: 'Current Savings ($)',
    retirement_age_goal: 'Retirement Age Goal',
    contribution_amount: 'Contribution Amount ($)',
    contribution_frequency: 'Contribution Frequency',
    employer_contribution: 'Employer Contribution',
    total_annual_contribution: 'Total Annual Contribution ($)',
    years_contributed: 'Years Contributed',
    investment_type: 'Investment Type',
    fund_name: 'Fund Name',
    annual_return_rate: 'Annual Return Rate (%)',
    projected_pension_amount: 'Projected Pension Amount ($)',
    inflation_adjusted_payout: 'Inflation Adjusted Payout ($)',
    years_of_payout: 'Years of Payout',
    transaction_id: 'Transaction ID',
    transaction_amount: 'Transaction Amount ($)',
    transaction_date: 'Transaction Date',
    government_pension_eligibility: 'Government Pension Eligibility',
    account_age: 'Account Age (years)',
    retirement_readiness_score: "Retirement Readiness Score",
    retirement_coverage_years: "Retirement Coverage Years",
    emergency_fund_months: "Emergency Fund (Months)",
    projected_networth: "Projected Net Worth",
  };


  function ChatbotAssistant({ isDark }) {
    const { messages, sendMessage, loading } = useChatbot();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');

    const handleSend = async () => {
      if (!input.trim() || loading) return;
      
      // Provide member context for better responses
      const memberContext = {
        isAdvisor: false,
        role: 'member',
        capabilities: ['balance_inquiry', 'contribution_planning', 'retirement_projections', 'personal_advice'],
        dataAccess: 'individual',
        userData: data.length > 0 ? data[0] : null
      };
      
      await sendMessage(input, memberContext);
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
            }}>💰 AI Pension Assistant</div>
            <div style={{
              fontSize: '12px',
              color: isDark ? '#9ca3af' : '#6b7280',
              marginTop: '2px'
            }}>Your personal retirement advisor</div>
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
                    : (isDark ? '#1d4ed8' : '#3b82f6'),
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
                    }}>AI Assistant</div>
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
                    Analyzing your pension data...
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
                placeholder="Ask about your balance, contributions, projections..."
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
                    : '#3b82f6',
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
              {['Check my balance', 'Retirement projections', 'Optimize contributions'].map((suggestion, idx) => (
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
            background: isDark ? '#1d4ed8' : '#3b82f6',
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
          title="AI Pension Assistant"
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

  // PDF
  const exportToPDF = async () => {
    if (typeof window === "undefined") return;
    try {
      const { jsPDF } = await import("jspdf");   // ✅ no .default here
      const html2canvas = (await import("html2canvas")).default;

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Pension Analysis Report", 20, 20);

      // Example chart capture
      const charts = document.querySelectorAll(".plotly");
      if (charts.length > 0) {
        const canvas = await html2canvas(charts[0]);
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 10, 20, 190, 100);
      }

      doc.save("Pension_Report.pdf");
      addToExportHistory("Pension_Report.pdf", "2.4 MB", "PDF");
    } catch (err) {
      console.error("Failed to export PDF:", err);
    }
  };


  const exportToPowerPoint = async () => {
    try {
      const response = await fetch('/api/export/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          reportTitle: "Pension Analysis Presentation"
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'Board_Presentation.pptx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToExportHistory("Board_Presentation.pptx", "5.2 MB", "PPTX");
    } catch (err) {
      console.error("Failed to export PowerPoint:", err);
    }
  };
  const exportToExcel = async () => {
    const XLSX = await import('xlsx');

    const wb = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = data.length > 0 ? [
      ['Metric', 'Value'],
      ['Total Savings', data[0].current_savings || 'N/A'],
      ['Projected Pension', data[0].projected_pension_amount || 'N/A'],
      ['Annual Return Rate', parseFloat(data[0].annual_return_rate || 0).toFixed(1) + '%'],
      ['Years to Retirement', (data[0].retirement_age_goal - data[0].age) || 'N/A']
    ] : [];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');

    // Create raw data sheet
    if (data.length > 0) {
      const dataWS = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, dataWS, 'Raw Data');
    }

    XLSX.writeFile(wb, 'Member_Analysis_Charts.xlsx');

    addToExportHistory('Member_Analysis_Charts.xlsx', '1.8 MB', 'XLSX');
  };

  // Export history state
  const [exportHistory, setExportHistory] = useState([
    { name: 'Q4_2024_Pension_Report.pdf', date: '2024-12-15', size: '2.4 MB', status: 'completed', type: 'PDF' },
    { name: 'Member_Analysis_Charts.xlsx', date: '2024-12-10', size: '1.8 MB', status: 'completed', type: 'XLSX' },
    { name: 'Board_Presentation.pptx', date: '2024-12-08', size: '5.2 MB', status: 'completed', type: 'PPTX' }
  ]);

  const addToExportHistory = (name, size, type) => {
    const newExport = {
      name,
      date: new Date().toISOString().split('T')[0],
      size,
      status: 'completed',
      type
    };
    setExportHistory(prev => [newExport, ...prev]);
  };

  // Load data from JSON file
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/dataset_augmented.json');

        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();

        if (!Array.isArray(jsonData)) {
          throw new Error('Data must be an array of objects');
        }

        // ✅ filter by currentUserId if passed
        let filteredData = jsonData;
        if (currentUserId) {
          filteredData = jsonData.filter(row => row.User_ID === currentUserId);
        }

        if (filteredData.length === 0) {
          throw new Error(currentUserId ? `No data found for user ${currentUserId}` : 'No data found in dataset');
        }
        console.log(`Loaded data for user ${currentUserId}:`, filteredData);
        setData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUserId]);




  // Get available numeric columns for charting
  const getNumericColumns = () => {
    if (data.length === 0) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return typeof value === 'number' || !isNaN(Number(value));
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
      // Convert to number if it's a numeric column
      if (typeof value === 'number') return value;
      if (!isNaN(Number(value))) return Number(value);
      return value;
    });
  };

  // Sample AI insights (you can enhance this to analyze actual data)
  const getAIInsights = (chart) => {
    if (data.length === 0) {
      return [
        {
          icon: '📊',
          title: 'Data Loading',
          text: 'Please wait while we load your pension data for analysis.'
        }
      ];
    }

    const xData = getColumnData(chart.xAxis);
    const yData = getColumnData(chart.yAxis);

    // Basic correlation calculation for numeric data
    let correlation = 'N/A';
    if (xData.every(x => typeof x === 'number') && yData.every(y => typeof y === 'number')) {
      const n = xData.length;
      const sumX = xData.reduce((a, b) => a + b, 0);
      const sumY = yData.reduce((a, b) => a + b, 0);
      const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
      const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
      const sumY2 = yData.reduce((sum, y) => sum + y * y, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

      if (denominator !== 0) {
        correlation = (numerator / denominator).toFixed(2);
      }
    }

    return [
      {
        icon: '📈',
        title: 'Data Correlation',
        text: `Analyzing relationship between ${variableNames[chart.xAxis]} and ${variableNames[chart.yAxis]}. ${correlation !== 'N/A' ? `Correlation coefficient: ${correlation}` : 'Statistical analysis in progress.'}`
      },
      {
        icon: '💡',
        title: 'Data Insights',
        text: `Dataset contains ${data.length} member records with ${getAllColumns().length} variables. This provides comprehensive coverage for pension analysis.`
      },
      {
        icon: '⚠️',
        title: 'Data Quality',
        text: `Data validation shows ${data.length} complete records. Consider data cleaning if any missing values are detected.`
      },
      {
        icon: '🎯',
        title: 'Recommendation',
        text: `Based on the current data distribution, consider analyzing ${variableNames[chart.xAxis]} patterns for better member segmentation.`
      }
    ];
  };

  // Function to get chart data based on configuration
  const getChartData = (config) => {
    if (data.length === 0) return [];

    const colors = colorSchemes[config.colorScheme]?.colors || colorSchemes.default.colors;

    // For real backend data, we work with flat fields
    const xData = getColumnData(config.xAxis);
    const yData = getColumnData(config.yAxis);

    if (config.chartType === 'scatter') {
      return [{
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: colors[0],
          size: 10,
          line: { color: isDark ? '#374151' : 'white', width: 2 },
          opacity: 0.8
        },
        name: `${variableNames[config.xAxis] || config.xAxis} vs ${variableNames[config.yAxis] || config.yAxis}`
      }];
    } else if (config.chartType === 'bar') {
      return [{
        x: xData,
        y: yData,
        type: 'bar',
        marker: {
          color: colors[0],
          opacity: 0.8,
          line: { color: isDark ? '#374151' : 'white', width: 1 }
        },
        name: `${variableNames[config.xAxis] || config.xAxis} vs ${variableNames[config.yAxis] || config.yAxis}`
      }];
    } else if (config.chartType === 'line') {
      // Sort data by x-axis for line charts
      const sortedData = xData.map((x, i) => ({ x, y: yData[i] }))
        .sort((a, b) => a.x - b.x);

      return [{
        x: sortedData.map(d => d.x),
        y: sortedData.map(d => d.y),
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: colors[0], width: 3 },
        marker: { size: 8, color: colors[0] },
        name: `${variableNames[config.xAxis] || config.xAxis} vs ${variableNames[config.yAxis] || config.yAxis}`
      }];
    } else if (config.chartType === 'histogram') {
      return [{
        x: yData,
        type: 'histogram',
        marker: { color: colors[0], opacity: 0.8 },
        name: `Distribution of ${variableNames[config.yAxis] || config.yAxis}`
      }];
    }

    return [];
  };

  // Handle opening config modal for new chart
  const handleAddChart = (chartId) => {
    const numericColumns = getNumericColumns();
    const defaultY = numericColumns.includes('projected_pension_amount') ? 'projected_pension_amount' : numericColumns[0];
    const defaultX = numericColumns.includes('age') ? 'age' : numericColumns[1] || numericColumns[0];

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
      ctx.fillText(`Personal Pension Analysis`, 40, 60);
      
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`Chart Type: ${chart.chartType}`, 40, 120);
      ctx.fillText(`X-Axis: ${variableNames[chart.xAxis] || chart.xAxis}`, 40, 160);
      ctx.fillText(`Y-Axis: ${variableNames[chart.yAxis] || chart.yAxis}`, 40, 200);
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('Personal pension data visualization for AI analysis', 40, 260);
      ctx.fillText('Chart contains your financial insights', 40, 290);
      
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
      ctx.fillStyle = '#10b981'; // Green for member theme
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
          ctx.strokeStyle = '#10b981';
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
          type: 'personal_pension_analysis'
        },
        graphType: 'personal_pension_chart'
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
        console.log('� AI Analysis type:', typeof aiAnalysis);
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

  // Enhanced chart base64 capture function
  const captureChartBase64 = async (chartId) => {
    setIsCapturingChart(true);
    setChartCaptureError(null);

    try {
      // Wait a moment for any DOM updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the chart div by targeting the Plotly chart container
      const chartContainers = document.querySelectorAll('.js-plotly-plot');

      if (chartContainers.length === 0) {
        throw new Error('No Plotly charts found on page');
      }

      // For member, we'll try to capture the specific chart based on position
      // Chart 1 = index 0, Chart 2 = index 1, etc.
      const chartIndex = chartId - 1;
      const targetChart = chartContainers[chartIndex];

      if (!targetChart) {
        throw new Error(`Chart ${chartId} not found`);
      }

      // Use Plotly's toImage function to get high quality base64
      const plotlyDiv = targetChart;

      if (!window.Plotly) {
        throw new Error('Plotly is not loaded');
      }

      console.log(`Capturing chart ${chartId}...`);

      // Capture with high quality settings
      const base64Image = await window.Plotly.toImage(plotlyDiv, {
        format: 'png',
        width: 1200,
        height: 800,
        scale: 2 // Higher resolution
      });

      // Clean the base64 data by removing the data URL prefix
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

      setChartBase64Data({
        chartId: chartId,
        fullDataUrl: base64Image,
        cleanBase64: cleanBase64,
        timestamp: new Date().toISOString(),
        chartConfig: gridCharts.find(c => c.id === chartId)
      });

      // Store globally for debugging
      window.memberChartBase64Data = {
        chartId: chartId,
        fullDataUrl: base64Image,
        cleanBase64: cleanBase64,
        timestamp: new Date().toISOString(),
        chartConfig: gridCharts.find(c => c.id === chartId)
      };

      console.log('Chart captured successfully!', {
        chartId,
        fullDataUrlLength: base64Image.length,
        cleanBase64Length: cleanBase64.length,
        preview: cleanBase64.substring(0, 100) + '...'
      });

      return cleanBase64; // Return the base64 data for AI analysis

    } catch (error) {
      console.error('Error capturing chart:', error);
      setChartCaptureError(error.message);
      return null; // Return null if capture fails
    } finally {
      setIsCapturingChart(false);
    }
  };

  // Parse AI analysis text into structured insights
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
    
    // Try multiple extraction patterns to handle various AI response formats
    const extractedInsights = [];
    
    // Pattern 1: Standard emoji patterns (🔸, 📈, 💡, etc. followed by content)
    const emojiPatterns = [
      /([🔸📈📊💡⚠️🎯💰🔍📋🔢📌✨🚀⭐🌟💎🎨🛡️📝🎪🎭🎯🏆🎖️🥇🥈🥉])[\s\*]*([^🔸📈📊💡⚠️🎯💰🔍📋🔢📌✨🚀⭐🌟💎🎨🛡️📝🎪🎭🎯🏆🎖️🥇🥈🥉\n]*)/g,
      // Pattern 2: Numbered insights (1., 2., 3., etc.)
      /^\d+\.\s*\*\*(.*?)\*\*:?\s*(.*)/,
      // Pattern 3: Bullet points with **bold** titles
      /^[-\*]\s*\*\*(.*?)\*\*:?\s*(.*)/,
      // Pattern 4: Simple **Bold Title**: Content
      /\*\*(.*?)\*\*:?\s*([^\*\n]+)/g
    ];
    
    // Try each pattern
    for (const pattern of emojiPatterns) {
      const matches = [...textToAnalyze.matchAll(pattern)];
      if (matches.length >= 3) {
        matches.forEach(match => {
          const emoji = match[1] || '📊';
          const content = (match[2] || '').trim();
          if (content.length > 10) { // Only include substantial content
            extractedInsights.push({ emoji, content, source: 'pattern' });
          }
        });
        break; // Use first successful pattern
      }
    }
    
    // Fallback: Extract from numbered lines if patterns didn't work
    // Fallback: Extract from numbered lines if patterns didn't work
    if (extractedInsights.length < 3) {
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
      
      console.log('🔍 Found numbered insights:', numberedInsights.length);
      extractedInsights.length = 0; // Clear previous attempts
      numberedInsights.forEach(insight => {
        extractedInsights.push({ 
          emoji: '📊', 
          content: `**${insight.title}**: ${insight.text}`, 
          source: 'numbered' 
        });
      });
    }
    
    console.log('🎯 Extracted insights from patterns:', extractedInsights.length);
    
    // If we found substantial insights, process them
    if (extractedInsights.length >= 3) {
      // Track used titles to prevent duplicates
      const usedTitles = new Set();
      
      extractedInsights.slice(0, 4).forEach((extractedInsight, index) => {
        let icon = extractedInsight.emoji || '�';
        let content = extractedInsight.content;
        
        // Extract title if content has a title pattern
        let title = 'Financial Insights';
        const titleMatch = content.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
        if (titleMatch) {
          const extractedTitle = titleMatch[1].trim();
          const remainingContent = titleMatch[2].trim();
          
          // Check for duplicates and rename if necessary
          let finalTitle = extractedTitle;
          let counter = 1;
          while (usedTitles.has(finalTitle.toLowerCase())) {
            finalTitle = `${extractedTitle} (${counter + 1})`;
            counter++;
          }
          usedTitles.add(finalTitle.toLowerCase());
          
          title = finalTitle;
          content = remainingContent;
        }
        
        // Map titles to member-appropriate icons and categories
        if (title.toLowerCase().includes('trend') || content.toLowerCase().includes('trend')) {
          icon = '💳';
          title = 'Your Financial Trends';
        } else if (title.toLowerCase().includes('performance') || content.toLowerCase().includes('performance')) {
          icon = '💰';
          title = 'Your Investment Performance';
        } else if (title.toLowerCase().includes('risk') || content.toLowerCase().includes('volatility')) {
          icon = '⚠️';
          title = 'Understanding Your Risk';
        } else if (content.toLowerCase().includes('recommend') || content.toLowerCase().includes('consider')) {
          icon = '🎯';
          // Use different titles for actionable content to avoid duplicates
          const actionTitles = ['Next Steps for You', 'Your Action Plan', 'Optimization Tips', 'Smart Moves'];
          const usedActionTitles = Array.from(usedTitles).filter(t => actionTitles.some(at => t.includes(at.toLowerCase())));
          title = actionTitles[usedActionTitles.length] || 'Your Financial Strategy';
        } else if (title.toLowerCase().includes('insight') || index === 0) {
          icon = '💡';
          title = 'Key Financial Insight';
        } else if (content.toLowerCase().includes('return') || content.toLowerCase().includes('financial')) {
          icon = '💰';
          title = 'Your Financial Health';
        }
        
        insights.push({
          icon: icon,
          title: title,
          text: content
        });
      });
      
      // Ensure exactly 4 insights
      return insights.slice(0, 4);
    }
    
    // Fallback to original keyword-based parsing if no numbered insights found
    
    // Extract key insights with member-appropriate icons and titles
    const insightPatterns = [
      {
        icon: '📈',
        title: 'Your Financial Trends',
        keywords: ['trend', 'increase', 'decrease', 'growth', 'decline', 'pattern', 'direction'],
        fallback: 'Understanding trends in your financial data helps you make informed decisions.'
      },
      {
        icon: '�',
        title: 'Your Investment Performance',
        keywords: ['distribution', 'spread', 'variance', 'range', 'cluster', 'outlier', 'performance'],
        fallback: 'Examining how your investments are performing across different areas.'
      },
      {
        icon: '💡',
        title: 'Key Financial Insight',
        keywords: ['insight', 'notable', 'significant', 'important', 'key', 'observe'],
        fallback: 'Important observations about your financial situation to consider.'
      },
      {
        icon: '⚠️',
        title: 'Understanding Your Risk',
        keywords: ['risk', 'concern', 'warning', 'issue', 'problem', 'volatility'],
        fallback: 'Areas of your portfolio that may need attention or monitoring.'
      },
      {
        icon: '🎯',
        title: 'Next Steps for You',
        keywords: ['recommend', 'suggest', 'should', 'consider', 'improve', 'optimize'],
        fallback: 'Actions you might consider to improve your financial position.'
      },
      {
        icon: '💰',
        title: 'Your Financial Health',
        keywords: ['financial', 'cost', 'benefit', 'value', 'return', 'performance'],
        fallback: 'How your investments are contributing to your overall financial wellbeing.'
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
      } else if (insights.length < 4) {
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
        const icons = ['�', '�', '🎯', '�'];
        const titles = ['Your Financial Insight', 'Your Trends', 'Next Steps', 'Your Progress'];
        
        insights.push({
          icon: icons[index % icons.length],
          title: titles[index % titles.length],
          text: paragraph.trim()
        });
      });
    }

    // Ensure we have exactly 4 insights with member-focused fallbacks
    if (insights.length === 0) {
      return [
        {
          icon: '💡',
          title: 'Your Financial Health',
          text: 'Your pension data shows important patterns that can help you make informed decisions about your financial future.'
        },
        {
          icon: '📈',
          title: 'Understanding Your Trends',
          text: 'Monitor how your investments change over time to identify opportunities for optimization.'
        },
        {
          icon: '🎯',
          title: 'Action Steps',
          text: 'Consider reviewing your investment allocation and consulting with a financial advisor for personalized guidance.'
        },
        {
          icon: '💰',
          title: 'Your Progress',
          text: 'Regular monitoring of your pension performance helps ensure you stay on track for your retirement goals.'
        }
      ];
    }

    return insights.slice(0, 4); // Limit to exactly 4 insights
  };

  // Function to download the captured chart
  const downloadCapturedChart = () => {
    if (!chartBase64Data) {
      alert('No chart data captured yet');
      return;
    }

    try {
      // Create download link using the full data URL
      const link = document.createElement('a');
      link.href = chartBase64Data.fullDataUrl;

      const chart = gridCharts.find(c => c.id === chartBase64Data.chartId);
      const filename = `member-chart-${chartBase64Data.chartId}-${chart?.xAxis || 'chart'}-vs-${chart?.yAxis || 'data'}.png`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Chart download initiated');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart: ' + error.message);
    }
  };

  // Function to test base64 validity
  const testBase64Image = () => {
    if (!chartBase64Data) {
      alert('No chart data captured yet');
      return;
    }

    // Open image in new window to test
    const testWindow = window.open('', '_blank');
    testWindow.document.write(`
      <html>
        <head><title>Chart Test</title></head>
        <body style="margin:0; background:#f0f0f0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
          <div style="text-align:center; padding:20px;">
            <h2>Chart Capture Test</h2>
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

      // Find the highest configured chart ID
      const maxConfiguredId = Math.max(...updated.filter(c => c.isConfigured).map(c => c.id));

      // If we don't already have all 4, add the next one
      if (updated.length < 4 && maxConfiguredId === updated.length) {
        updated.push({ id: updated.length + 1, isConfigured: false });
      }

      // Save to localStorage
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
      const reIndexed = updated.map((chart, index) => ({
        ...chart,
        id: index + 1
      }));

      // Save to localStorage
      saveChartPreferences(reIndexed);

      return reIndexed;
    });
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.dropdown-menu') || e.target.closest('.dropdown-toggle')) {
        return;
      }
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Common header component
  const renderHeader = (title) => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
  );

  // Loading component
  const renderLoading = () => (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <h3 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
          }`}>Loading Pension Data...</h3>
        <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Please wait while we fetch your data</p>
      </div>
    </div>
  );

  // Error component
  const renderError = () => (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
          }`}>Error Loading Data</h3>
        <p className={`mb-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const renderChartsTab = () => {
    if (loading) return renderLoading();
    if (error) return renderError();

    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {renderHeader('Chart Builder Dashboard')}

            {/* Data Summary */}
            <div className={`rounded-xl p-4 mb-6 transition-all duration-300 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'
              }`}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Data Loaded: {data.length} records</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Variables: {getAllColumns().length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Numeric: {getNumericColumns().length}</span>
                </div>
              </div>
            </div>

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: 'Total Savings',
                  value: data.length > 0 ? `$${data[0].current_savings?.toLocaleString() || 'N/A'}` : 'Loading...',
                  change: '+12.5%',
                  changeType: 'positive',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  )
                },
                {
                  title: 'Projected Pension',
                  value: data.length > 0 ? `$${data[0].projected_pension_amount?.toLocaleString() || 'N/A'}` : 'Loading...',
                  change: '+8.2%',
                  changeType: 'positive',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )
                },
                {
                  title: 'Annual Return',
                  value: data.length > 0 ? `${parseFloat(data[0].annual_return_rate || 0).toFixed(1)}%` : 'Loading...',
                  change: '+2.1%',
                  changeType: 'positive',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                {
                  title: 'Years to Retirement',
                  value: data.length > 0 ? `${data[0].retirement_age_goal - data[0].age || 'N/A'} years` : 'Loading...',
                  change: '-1 year',
                  changeType: 'neutral',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      {kpi.changeType === 'positive' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      )}
                      {kpi.changeType === 'negative' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-9.2 9.2M7 7v10h10" />
                        </svg>
                      )}
                      <span className="font-medium">{kpi.change}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                      {kpi.value}
                    </h3>
                    <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {kpi.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4-Grid Chart Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gridCharts.map((chart) => (
                <div key={chart.id} className={`rounded-2xl shadow-xl border transition-all duration-300 backdrop-blur-sm ${isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-100'
                  }`}>
                  {chart.isConfigured ? (
                    <>
                      {/* Chart Header with Options */}
                      <div className={`flex justify-between items-center p-4 border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <h3 className={`text-lg font-semibold break-words whitespace-normal transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {variableNames[chart.xAxis] || chart.xAxis} vs {variableNames[chart.yAxis] || chart.yAxis}
                        </h3>

                        <div className="flex items-center space-x-2">
                          {/* AI Insights Button */}
                          <button
                            onClick={() => handleViewAIInsights(chart.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${isDark
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                              } transform hover:scale-105 shadow-lg`}
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
                              className={`p-2 rounded-lg transition-all duration-300 dropdown-toggle ${isDark
                                  ? 'hover:bg-gray-700 text-gray-300'
                                  : 'hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                              </svg>
                            </button>

                            {activeDropdown === chart.id && (
                              <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border z-50 dropdown-menu transition-all duration-300 ${isDark
                                  ? 'bg-gray-800 border-gray-600'
                                  : 'bg-white border-gray-200'
                                }`} onClick={(e) => e.stopPropagation()}>
                                <div className="py-2">
                                  <button
                                    onClick={() => handleEditChart(chart.id)}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${isDark
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Chart
                                  </button>
                                  <button
                                    onClick={() => handleCustomizeChart(chart.id)}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${isDark
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
                                    </svg>
                                    Customize Style
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChart(chart.id)}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${isDark
                                        ? 'text-red-400 hover:bg-gray-700'
                                        : 'text-red-600 hover:bg-gray-50'
                                      }`}
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
                              displayModeBar: true,
                              displaylogo: false,
                              modeBarButtonsToRemove: ["sendDataToCloud"],
                              toImageButtonOptions: {
                                format: "png",
                                filename: `member-chart-${chart.id}`,
                                height: 800,
                                width: 1200,
                                scale: 2
                              }
                            }}
                            divId={`member-chart-${chart.id}`}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Add Chart Placeholder
                    <div
                      onClick={() => handleAddChart(chart.id)}
                      className={`h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${isDark
                          ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                        }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg ${isDark
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                          : 'bg-gradient-to-br from-blue-500 to-purple-500'
                        }`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDark
                          ? 'text-gray-300 group-hover:text-blue-400'
                          : 'text-gray-600 group-hover:text-blue-600'
                        }`}>Add Chart</h3>
                      <p className={`text-sm mt-2 transition-colors duration-300 ${isDark
                          ? 'text-gray-400 group-hover:text-blue-300'
                          : 'text-gray-500 group-hover:text-blue-500'
                        }`}>Click to configure a new chart</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Insights Modal */}
            {showAIInsightsModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                  {/* Modal Header */}
                  <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600'
                          : 'bg-gradient-to-br from-purple-500 to-blue-500'
                        }`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>AI Insights</h3>
                          {chartBase64Data && chartBase64Data.chartId === activeInsightChartId && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Chart Captured
                            </span>
                          )}
                          {isCapturingChart && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full animate-pulse">
                              Capturing...
                            </span>
                          )}
                          {chartCaptureError && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Capture Failed
                            </span>
                          )}
                        </div>
                        {activeInsightChartId && (
                          <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
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
                      className={`p-2 rounded-lg transition-all duration-300 ${isDark
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {/* AI Insights Loading or Content */}
                    {isLoadingInsights ? (
                      <div className={`mb-6 p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${isDark
                        ? 'border-gray-600 bg-gray-800/30'
                        : 'border-gray-300 bg-gray-50'
                        }`}>
                        <div className="flex items-center justify-center space-x-3 mb-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-500 border-t-transparent"></div>
                          <span className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                            AI Analysis in Progress
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${insightProgress}%` }}
                          ></div>
                        </div>
                        
                        {/* Status Message */}
                        <p className={`text-sm text-center transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {insightStatusMessage || 'Processing your chart with AI...'}
                        </p>
                        
                        {/* Progress Percentage */}
                        <p className={`text-xs text-center mt-2 font-mono transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                          {Math.round(insightProgress)}% complete
                        </p>
                        
                        {/* Estimated Time */}
                        {insightProgress > 30 && insightProgress < 90 && (
                          <p className={`text-xs text-center mt-1 transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                            This may take up to 2 minutes for AI analysis...
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Error Message */}
                        {insightError && (
                          <div className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${isDark
                            ? 'bg-yellow-800/20 border-yellow-600 text-yellow-300'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            }`}>
                            <div className="flex items-center space-x-2">
                              <span>⚠️</span>
                              <span className="text-sm">{insightError}</span>
                            </div>
                          </div>
                        )}

                        {/* AI Insights List */}
                        <div className="space-y-4">
                          {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                            <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDark
                                ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300'
                              }`}>
                              <div className="flex items-start space-x-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isDark
                                    ? 'bg-gray-600'
                                    : 'bg-white shadow-sm'
                                  }`}>
                                  {insight.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {insight.title}
                                  </h4>
                                  <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {insight.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className={`p-6 text-center rounded-xl border transition-all duration-300 ${isDark
                              ? 'border-gray-600 bg-gray-800/30 text-gray-400'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                              }`}>
                              <div className="text-4xl mb-2">🤖</div>
                              <p>No insights available for this chart.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 mt-8">
                      <button
                        onClick={() => setShowAIInsightsModal(false)}
                        className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        Close
                      </button>

                      {/* Chart Capture Controls */}
                      {chartBase64Data && chartBase64Data.chartId === activeInsightChartId ? (
                        <div className="flex space-x-2 flex-1">
                          <button
                            onClick={downloadCapturedChart}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download Chart</span>
                          </button>
                          <button
                            onClick={testBase64Image}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Test Image</span>
                          </button>
                          <button
                            onClick={() => captureChartBase64(activeInsightChartId)}
                            disabled={isCapturingChart}
                            className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => captureChartBase64(activeInsightChartId)}
                          disabled={isCapturingChart}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {isCapturingChart ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Capturing Chart...</span>
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
                      )}
                    </div>

                    {/* Debug Info */}
                    {chartBase64Data && chartBase64Data.chartId === activeInsightChartId && (
                      <div className={`mt-4 p-3 rounded-lg border text-xs transition-all duration-300 ${isDark ? 'bg-gray-700/50 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}>
                        <p><strong>Chart ID:</strong> {chartBase64Data.chartId}</p>
                        <p><strong>Captured:</strong> {new Date(chartBase64Data.timestamp).toLocaleString()}</p>
                        <p><strong>Full Data URL:</strong> {chartBase64Data.fullDataUrl.length} characters</p>
                        <p><strong>Clean Base64:</strong> {chartBase64Data.cleanBase64.length} characters</p>
                        <p><strong>Preview:</strong> {chartBase64Data.cleanBase64.substring(0, 50)}...</p>
                        <p className="text-blue-600"><strong>Access in console:</strong> window.memberChartBase64Data</p>
                      </div>
                    )}

                    {chartCaptureError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <p><strong>Capture Error:</strong> {chartCaptureError}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chart Configuration Modal */}
            {showConfigModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                      }`}>Configure Chart</h3>
                    <button
                      onClick={() => setShowConfigModal(false)}
                      className={`p-2 rounded-lg transition-all duration-300 ${isDark
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Chart Type */}
                    <div>
                      <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>Chart Type</label>
                      <select
                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${isDark
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                          } focus:ring-2 focus:ring-blue-200`}
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
                      <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>X-Axis Variable</label>
                      <select
                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${isDark
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                          } focus:ring-2 focus:ring-blue-200`}
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
                      <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>Y-Axis Variable</label>
                      <select
                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${isDark
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500'
                          } focus:ring-2 focus:ring-purple-200`}
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
                      <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>Color Scheme</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(colorSchemes).map(([key, scheme]) => (
                          <button
                            key={key}
                            onClick={() => setTempConfig({ ...tempConfig, colorScheme: key })}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${tempConfig.colorScheme === key
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : isDark
                                  ? 'border-gray-600 hover:border-gray-500'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            <div className={`w-full h-6 rounded-lg mb-2 bg-gradient-to-r ${scheme.gradient}`}></div>
                            <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>{scheme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show Insights Toggle */}
                    <div className="flex items-center justify-between">
                      <label className={`text-sm font-bold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>Show AI Insights</label>
                      <button
                        onClick={() => setTempConfig({ ...tempConfig, showInsights: !tempConfig.showInsights })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${tempConfig.showInsights ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${tempConfig.showInsights ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setShowConfigModal(false)}
                      className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
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
            )}

            {/* Customization Modal */}
            {showCustomizeModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                      }`}>Customize Style</h3>
                    <button
                      onClick={() => setShowCustomizeModal(false)}
                      className={`p-2 rounded-lg transition-all duration-300 ${isDark
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Color Schemes */}
                    <div>
                      <label className={`block text-sm font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>Choose Color Palette</label>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(colorSchemes).map(([key, scheme]) => (
                          <button
                            key={key}
                            onClick={() => setTempConfig({ ...tempConfig, colorScheme: key })}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${tempConfig.colorScheme === key
                                ? 'border-blue-500 ring-2 ring-blue-200 transform scale-105'
                                : isDark
                                  ? 'border-gray-600 hover:border-gray-500'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            <div className="flex space-x-1">
                              {scheme.colors.slice(0, 5).map((color, index) => (
                                <div
                                  key={index}
                                  className="w-8 h-8 rounded-full shadow-sm"
                                  style={{ backgroundColor: color }}
                                ></div>
                              ))}
                            </div>
                            <div>
                              <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-900'
                                }`}>{scheme.name}</span>
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

                    {/* Custom Color Inputs */}
                    <div>
                      <label
                        className={`block text-sm font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                          }`}
                      >
                        Fine-tune Colors
                      </label>

                      <div className="grid grid-cols-3 gap-6">
                        {/* Primary */}
                        <div className="w-full">
                          <label
                            className={`text-xs font-medium mb-2 block transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}
                          >
                            Primary
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={tempConfig.customColors?.primary || '#3b82f6'}
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  customColors: {
                                    ...tempConfig.customColors,
                                    primary: e.target.value,
                                  },
                                })
                              }
                              className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={tempConfig.customColors?.primary || '#3b82f6'}
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  customColors: {
                                    ...tempConfig.customColors,
                                    primary: e.target.value,
                                  },
                                })
                              }
                              className={`w-full text-xs px-2 py-2 rounded border transition-all duration-300 ${isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            />
                          </div>
                        </div>

                        {/* Secondary */}
                        <div className="w-full">
                          <label
                            className={`text-xs font-medium mb-2 block transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}
                          >
                            Secondary
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={tempConfig.customColors?.secondary || '#8b5cf6'}
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  customColors: {
                                    ...tempConfig.customColors,
                                    secondary: e.target.value,
                                  },
                                })
                              }
                              className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={tempConfig.customColors?.secondary || '#8b5cf6'}
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  customColors: {
                                    ...tempConfig.customColors,
                                    secondary: e.target.value,
                                  },
                                })
                              }
                              className={`w-full text-xs px-2 py-2 rounded border transition-all duration-300 ${isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            />
                          </div>
                        </div>

                        {/* Accent */}
                        <div className="w-full">
                          <label
                            className={`text-xs font-medium mb-2 block transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}
                          >
                            Accent
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={tempConfig.customColors?.accent || '#06d6a0'}
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  customColors: {
                                    ...tempConfig.customColors,
                                    accent: e.target.value,
                                  },
                                })
                              }
                              className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={tempConfig.customColors?.accent || '#06d6a0'}
                              placeholder="#RRGGBB"
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  customColors: {
                                    ...tempConfig.customColors,
                                    accent: e.target.value,
                                  },
                                })
                              }
                              className={`w-full text-xs px-2 py-2 rounded border transition-all duration-300 ${isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className={`p-4 rounded-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                      <h4 className={`text-sm font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>Color Preview</h4>
                      <div className="flex space-x-2">
                        {(colorSchemes[tempConfig.colorScheme]?.colors || [
                          tempConfig.customColors?.primary,
                          tempConfig.customColors?.secondary,
                          tempConfig.customColors?.accent
                        ]).slice(0, 5).map((color, index) => (
                          <div
                            key={index}
                            className="w-12 h-12 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setShowConfigModal(false)}
                      className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
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
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderUploadTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {renderHeader('Data Upload & Preprocessing')}

          {/* Upload Area */}
          <div className={`rounded-2xl shadow-lg border p-8 mb-8 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${isDark
                ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
              }`}>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>Upload Pension Data</h3>
              <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Drag and drop your CSV, Excel, or JSON files here</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Browse Files
              </button>
              <p className={`text-sm mt-3 transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>Supported formats: CSV, XLSX, JSON (Max 50MB)</p>
            </div>
          </div>

          {/* Data Processing Status */}
          <div className={`rounded-2xl shadow-lg border p-6 mb-8 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
              }`}>Processing Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Data Validation</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-green-400' : 'text-green-600'
                    }`}>Complete</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Data Cleaning</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>In Progress</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Feature Engineering</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}></div>
                  <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className={`rounded-2xl shadow-lg border p-6 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
              }`}>Data Preview</h3>
            <div className={`rounded-lg border transition-all duration-300 ${isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
              <table className="w-full">
                <thead className={`transition-colors duration-300 ${isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Member ID</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Age</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Annual Income</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Contribution</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${isDark ? 'divide-gray-600' : 'divide-gray-200'
                  }`}>
                  {[
                    ['M001', '28', '$52,000', '$416'],
                    ['M002', '34', '$65,000', '$520'],
                    ['M003', '42', '$85,000', '$680'],
                    ['M004', '29', '$55,000', '$440']
                  ].map((row, index) => (
                    <tr key={index}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={`px-4 py-3 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {renderHeader('AI Analytics & Insights')}

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: 'Predictive Modeling',
                description: 'Forecast pension outcomes using advanced ML algorithms',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                status: 'active'
              },
              {
                title: 'Risk Assessment',
                description: 'Identify potential risks in pension portfolios',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ),
                status: 'coming-soon'
              },
              {
                title: 'Optimization Engine',
                description: 'Suggest optimal contribution strategies',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                status: 'beta'
              }
            ].map((feature, index) => (
              <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.status === 'active' ? 'bg-green-100 text-green-600' :
                    feature.status === 'beta' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-400'
                  }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</h3>
                <p className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${feature.status === 'active' ? 'bg-green-100 text-green-800' :
                      feature.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {feature.status === 'active' ? 'Active' :
                      feature.status === 'beta' ? 'Beta' : 'Coming Soon'}
                  </span>
                  <button className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 ${feature.status === 'active'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`} disabled={feature.status !== 'active'}>
                    {feature.status === 'active' ? 'Launch' : 'Soon'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights Panel */}
          <div className={`rounded-2xl shadow-lg border p-6 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <h3 className={`text-lg font-semibold mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
              }`}>Latest AI Insights</h3>
            <div className="space-y-4">
              {getAIInsights().map((insight, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-300 ${isDark
                    ? 'bg-gray-700/50 border-gray-600'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                  }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isDark ? 'bg-gray-600' : 'bg-white shadow-sm'
                      }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>{insight.title}</h4>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>{insight.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {renderHeader('Export & Reports')}

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: 'PDF Report',
                description: 'Generate comprehensive pension analysis reports',
                format: 'PDF',
                onClick: exportToPDF,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                title: 'Excel Export',
                description: 'Export data and charts to Excel format',
                format: 'XLSX',
                onClick: exportToExcel,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: 'PowerPoint',
                description: 'Create presentation-ready slides with charts',
                format: 'PPTX',
                onClick: exportToPowerPoint,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                )
              }
            ].map((exportOption, index) => (
              <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  {exportOption.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>{exportOption.title}</h3>
                <p className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{exportOption.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>{exportOption.format}</span>
                  <button
                    onClick={exportOption.onClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-sm"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Export History */}
          <div
            className={`rounded-2xl shadow-lg border p-6 backdrop-blur-sm transition-all duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"
                }`}
            >
              Export History
            </h3>
            <div className="space-y-3">
              {exportHistory.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${isDark ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4
                        className={`font-medium transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {file.name}
                      </h4>
                      <p
                        className={`text-sm transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        {file.date} • {file.size}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${isDark
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
      
    </div>

  );

  // Main switch statement
  const   renderContent = () => {
  switch (activeTab) {
    case 'memberUpload':
      return renderUploadTab();
    case 'memberCharts':
      return renderChartsTab();
    case 'memberAI':
      return renderAITab();
    case 'memberExport':
      return renderExportTab();
    default:
      return renderUploadTab();
}
}
return(
  <div>
    {renderContent()}
    <ChatbotAssistant isDark={isDark} />
  </div>
)}