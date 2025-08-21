'use client';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

import { useEffect, useState } from 'react';

function ChatbotAssistant({ isDark }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Thanks for your message! (Demo bot)' }]);
    }, 500);
    setInput('');
  };

  // Detect dark mode from body class
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
        <div style={{ fontWeight: 600, marginBottom: 8, color: isDark ? '#f3f4f6' : '#111827' }}>Chatbot Assistant</div>
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
        <div style={{ display: 'flex' }}>
          <input
            style={{
              flex: 1,
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 6,
              marginRight: 4,
              background: isDark ? '#111827' : '#fff',
              color: isDark ? '#f3f4f6' : '#111827',
              outline: 'none'
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type your message..."
          />
          <button
            style={{
              background: isDark ? '#10b981' : '#10b981',
              color: isDark ? '#fff' : '#fff',
              borderRadius: 8,
              padding: '6px 12px',
              fontWeight: 600,
              border: 'none',
              boxShadow: isDark ? '0 2px 8px rgba(16,185,129,0.15)' : '0 2px 8px rgba(16,185,129,0.12)',
              cursor: 'pointer'
            }}
            onClick={handleSend}
          >Send</button>
        </div>
      </div>
      <button
        style={{
          background: isDark ? '#047857' : '#047857',
          color: '#fff',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          fontSize: 28,
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chatbot"
      >💬</button>
    </div>
  );
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    obj.Initials = obj.Name ? obj.Name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
    obj.InitialsColor = obj.Gender === 'Male' ? 'bg-blue-100' : obj.Gender === 'Female' ? 'bg-purple-100' : 'bg-green-100';
    obj.InitialsText = obj.Gender === 'Male' ? 'text-blue-600' : obj.Gender === 'Female' ? 'text-purple-600' : 'text-green-600';
    return obj;
  });
}

// Chart preferences utilities
const saveChartPreferences = (charts) => {
  try {
    localStorage.setItem('advisor-chart-preferences', JSON.stringify(charts));
  } catch (error) {
    console.warn('Failed to save chart preferences:', error);
  }
};

const loadChartPreferences = () => {
  try {
    const saved = localStorage.getItem('advisor-chart-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load chart preferences:', error);
  }
  return null;
};

export default function AdvisorContent({ activeTab, isDark }) {
  const [clients, setClients] = useState([]);

  // Enhanced chart builder state (from member)
  const [chartConfig, setChartConfig] = useState({
    xAxis: 'Age',
    yAxis: 'Current_Savings',
    chartType: 'scatter'
  });

  const [gridCharts, setGridCharts] = useState(() => {
    // Try to load from localStorage first
    const savedCharts = loadChartPreferences();
    if (savedCharts && savedCharts.length > 0) {
      return savedCharts;
    }
    
    // Default charts if nothing saved
    return [
      {
        id: 1,
        xAxis: 'Age',
        yAxis: 'Current_Savings',
        chartType: 'scatter',
        isConfigured: true,
        colorScheme: 'default',
        showInsights: true,
        customColors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#06d6a0'
        }
      },
      { id: 2, isConfigured: false }
    ];
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);
  const [activeInsightChartId, setActiveInsightChartId] = useState(null);
  const [editingChartId, setEditingChartId] = useState(null);
  const [tempConfig, setTempConfig] = useState({
    xAxis: 'Age',
    yAxis: 'Current_Savings',
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
    },
    ocean: {
      name: 'Ocean',
      colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'],
      gradient: 'from-sky-500 to-teal-400'
    },
    sunset: {
      name: 'Sunset',
      colors: ['#f59e0b', '#f97316', '#ef4444', '#ec4899'],
      gradient: 'from-amber-500 to-pink-500'
    }
  };
  useEffect(() => {
    fetch('/dummy_clients.csv')
      .then(res => res.text())
      .then(text => setClients(parseCSV(text)));
  }, []);

  const renderPortfolioTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Portfolio Management</h2>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Clients</p>
            <p className="text-2xl font-bold text-gray-900">247</p>
            <p className="text-sm text-green-600">+12 this month</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Assets Under Management</p>
            <p className="text-2xl font-bold text-gray-900">$45.2M</p>
            <p className="text-sm text-green-600">+8.3% YTD</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Avg Portfolio Performance</p>
            <p className="text-2xl font-bold text-gray-900">7.8%</p>
            <p className="text-sm text-green-600">Above benchmark</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Clients Needing Review</p>
            <p className="text-2xl font-bold text-gray-900">18</p>
            <p className="text-sm text-orange-600">Action required</p>
          </div>
        </div>

        {/* Client List - now uses dummy dataset */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Client Overview</h3>
            <div className="flex space-x-2">
              <input type="text" placeholder="Search clients..." className={`border border-gray-300 rounded-lg px-3 py-2 text-sm ${isDark ? "text-white" : "bg-white text-gray-900"}`} />
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Add Client
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>User ID</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Client</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Annual Income</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Current Savings</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Risk Tolerance</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Retirement Age Goal</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.User_ID}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.User_ID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${client.InitialsColor} rounded-full flex items-center justify-center`}>
                          <span className={`${client.InitialsText} font-medium text-sm`}>{client.Initials}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{client.Name}</p>
                          <p className="text-sm text-gray-500">Age {client.Age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.Annual_Income ? `$${client.Annual_Income}` : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.Current_Savings ? `$${client.Current_Savings}` : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${client.Risk_Tolerance === 'Low' ? 'bg-green-100 text-green-800' : client.Risk_Tolerance === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{client.Risk_Tolerance}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.Retirement_Age_Goal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="text-green-600 hover:text-green-700 mr-3"
                        onClick={() => {
                          const reportHtml = `<!DOCTYPE html><html><head><title>Client Report</title>
                        <style>
                          body{font-family:sans-serif;padding:2rem;}
                          h2{color:#047857;}
                          table{width:100%;border-collapse:collapse;}
                          th,td{padding:8px 12px;border-bottom:1px solid #eee;}
                          th{background:#f3f4f6;text-align:left;}
                          tr:last-child td{border-bottom:none;}
                          tr:nth-child(even){background:#f9fafb;}
                          @media(max-width:600px){table,th,td{font-size:12px;}}
                          .tab{display:inline-block;padding:8px 24px;margin-right:8px;border-radius:8px;cursor:pointer;background:#f3f4f6;color:#047857;font-weight:600;}
                          .tab.active{background:#047857;color:#fff;}
                          .tab-content{margin-top:24px;}
                        </style>
                        <script>
                          function showTab(tab){
                            document.getElementById('tab-report').style.display=tab==='report'?'block':'none';
                            document.getElementById('tab-transactions').style.display=tab==='transactions'?'block':'none';
                            document.getElementById('tab-btn-report').classList.toggle('active',tab==='report');
                            document.getElementById('tab-btn-transactions').classList.toggle('active',tab==='transactions');
                          }
                        </script>
                        </head><body>
                          <h2>Client Report</h2>
                          <div>
                            <span id='tab-btn-report' class='tab active' onclick='showTab(\"report\")'>Full Report</span>
                            <span id='tab-btn-transactions' class='tab' onclick='showTab(\"transactions\")'>Transaction History</span>
                          </div>
                          <div id='tab-report' class='tab-content'>
                            <table><tbody>
                              ${Object.entries(client).filter(([k]) => !['Initials', 'InitialsColor', 'InitialsText'].includes(k)).map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join('')}
                            </tbody></table>
                          </div>
                          <div id='tab-transactions' class='tab-content' style='display:none;'>
                            <table>
                              <thead><tr><th>Date</th><th>Transaction ID</th><th>Amount</th><th>Channel</th></tr></thead>
                              <tbody>
                                <tr>
                                  <td>${client.Transaction_Date}</td>
                                  <td>${client.Transaction_ID}</td>
                                  <td>${client.Transaction_Amount}</td>
                                  <td>${client.Transaction_Channel}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </body></html>`;
                          const win = window.open('', '_blank');
                          win.document.write(reportHtml);
                          win.document.close();
                        }}
                      >View</button>
                      {/* Edit button removed for advisor */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Analytics</h2>
        {/* Reuse the same table as portfolio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Overview</h3>
            <div className="flex space-x-2">
              <input type="text" placeholder="Search clients..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Add Client
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>User ID</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Client</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Annual Income</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Current Savings</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Risk Tolerance</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Retirement Age Goal</th>
                  <th className={isDark ? "px-6 py-3 text-left text-xs font-bold text-gray-200 uppercase" : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.User_ID}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.User_ID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${client.InitialsColor} rounded-full flex items-center justify-center`}>
                          <span className={`${client.InitialsText} font-medium text-sm`}>{client.Initials}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{client.Name}</p>
                          <p className="text-sm text-gray-500">Age {client.Age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.Annual_Income ? `$${client.Annual_Income}` : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.Current_Savings ? `$${client.Current_Savings}` : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${client.Risk_Tolerance === 'Low' ? 'bg-green-100 text-green-800' : client.Risk_Tolerance === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{client.Risk_Tolerance}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.Retirement_Age_Goal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="text-green-600 hover:text-green-700 mr-3"
                        onClick={() => {
                          const reportHtml = `<!DOCTYPE html><html><head><title>Client Report</title><style>body{font-family:sans-serif;padding:2rem;}h2{color:#047857;}table{width:100%;border-collapse:collapse;}th,td{padding:8px 12px;border-bottom:1px solid #eee;}th{background:#f3f4f6;text-align:left;}tr:last-child td{border-bottom:none;}tr:nth-child(even){background:#f9fafb;}@media(max-width:600px){table,th,td{font-size:12px;}}.tab{display:inline-block;padding:8px 24px;margin-right:8px;border-radius:8px;cursor:pointer;background:#f3f4f6;color:#047857;font-weight:600;} .tab.active{background:#047857;color:#fff;} .tab-content{margin-top:24px;}</style><script>function showTab(tab){document.getElementById('tab-report').style.display=tab==='report'?'block':'none';document.getElementById('tab-transactions').style.display=tab==='transactions'?'block':'none';document.getElementById('tab-btn-report').classList.toggle('active',tab==='report');document.getElementById('tab-btn-transactions').classList.toggle('active',tab==='transactions');}</script></head><body><h2>Client Report</h2><div><span id='tab-btn-report' class='tab active' onclick='showTab("report")'>Full Report</span><span id='tab-btn-transactions' class='tab' onclick='showTab("transactions")'>Transaction History</span></div><div id='tab-report' class='tab-content'><table><tbody>${Object.entries(client).filter(([k]) => !['Initials', 'InitialsColor', 'InitialsText'].includes(k)).map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join('')}</tbody></table></div><div id='tab-transactions' class='tab-content' style='display:none;'><table><thead><tr><th>Date</th><th>Transaction ID</th><th>Amount</th><th>Channel</th></tr></thead><tbody><tr><td>${client.Transaction_Date}</td><td>${client.Transaction_ID}</td><td>${client.Transaction_Amount}</td><td>${client.Transaction_Channel}</td></tr></tbody></table></div></body></html>`;
                          const win = window.open('', '_blank');
                          win.document.write(reportHtml);
                          win.document.close();
                        }}
                      >View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advisor Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Portfolio Report</h3>
            <p className="text-gray-600 text-sm mb-4">Comprehensive overview of all client portfolios and performance metrics</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Generate Report
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-gray-600 text-sm mb-4">Detailed analysis of portfolio performance and risk metrics</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Generate Report
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Summary</h3>
            <p className="text-gray-600 text-sm mb-4">Regulatory compliance status and required actions</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Planning Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirement Calculator</h3>
            <p className="text-gray-600 mb-6">Calculate retirement projections for your clients</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
                <input type="number" defaultValue="35" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retirement Age</label>
                <input type="number" defaultValue="65" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution</label>
                <input type="number" defaultValue="500" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Return (%)</label>
                <input type="number" defaultValue="7" step="0.1" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                Calculate Projection
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            <p className="text-gray-600 mb-6">Evaluate client risk tolerance and portfolio allocation</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Short-term (&lt; 5 years)</option>
                  <option>Medium-term (5-15 years)</option>
                  <option>Long-term (&gt; 15 years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                Generate Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced variable names for advisor data
  const variableNames = {
    Age: 'Age (years)',
    Annual_Income: 'Annual Income ($)',
    Current_Savings: 'Current Savings ($)',
    Risk_Tolerance: 'Risk Tolerance',
    Retirement_Age_Goal: 'Retirement Age Goal',
    Transaction_Amount: 'Transaction Amount ($)',
    Transaction_Channel: 'Transaction Channel',
    Transaction_Date: 'Transaction Date',
    Transaction_ID: 'Transaction ID'
  };

  // Sample AI insights for advisor
  const getAIInsights = (chart) => {
    return [
      {
        icon: '📈',
        title: 'Client Portfolio Analysis',
        text: 'Strong correlation between age and savings. Clients aged 40+ show accelerated wealth accumulation patterns, suggesting optimal retirement preparation.'
      },
      {
        icon: '💡',
        title: 'Advisory Opportunity',
        text: 'Clients with moderate risk tolerance and high income show potential for increased contribution recommendations. Consider portfolio optimization strategies.'
      },
      {
        icon: '⚠️',
        title: 'Risk Assessment',
        text: 'Several clients with high-risk tolerance have savings below recommended benchmarks for their age group. Intervention recommended.'
      },
      {
        icon: '🎯',
        title: 'Performance Insight',
        text: 'Clients with consistent transaction patterns achieve 31% better retirement outcomes compared to irregular contributors.'
      }
    ];
  };

  // Function to get chart data based on configuration
  const getChartData = (config) => {
    if (!clients.length) return [];
    
    const getClientValue = (client, field) => {
      const value = client[field];
      if (field === 'Risk_Tolerance') return value;
      return isNaN(Number(value)) ? value : Number(value);
    };

    const xData = clients.map(client => getClientValue(client, config.xAxis));
    const yData = clients.map(client => getClientValue(client, config.yAxis));
    const colors = colorSchemes[config.colorScheme]?.colors || colorSchemes.default.colors;
    
    if (config.chartType === 'scatter') {
      return [{
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'markers',
        marker: { 
          color: colors,
          size: 10,
          line: { color: isDark ? '#374151' : 'white', width: 2 },
          opacity: 0.8
        },
        name: `${variableNames[config.xAxis]} vs ${variableNames[config.yAxis]}`
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
        name: `${variableNames[config.xAxis]} vs ${variableNames[config.yAxis]}`
      }];
    } else if (config.chartType === 'line') {
      return [{
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: colors[0], width: 3 },
        marker: { size: 8, color: colors[0] },
        name: `${variableNames[config.xAxis]} vs ${variableNames[config.yAxis]}`
      }];
    } else if (config.chartType === 'histogram') {
      return [{
        x: yData,
        type: 'histogram',
        marker: { color: colors[0], opacity: 0.8 },
        name: `Distribution of ${variableNames[config.yAxis]}`
      }];
    }
  };

  // Enhanced chart handlers
  const handleAddChart = (chartId) => {
    setEditingChartId(chartId);
    setTempConfig({
      xAxis: 'Age',
      yAxis: 'Current_Savings',
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

  const handleViewAIInsights = (chartId) => {
    setActiveInsightChartId(chartId);
    setShowAIInsightsModal(true);
    setActiveDropdown(null);
  };

  const handleSaveChart = () => {
    setGridCharts(prev => {
      const updated = prev.map(chart =>
        chart.id === editingChartId
          ? { ...chart, ...tempConfig, isConfigured: true }
          : chart
      );

      const maxConfiguredId = Math.max(...updated.filter(c => c.isConfigured).map(c => c.id));

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



  // Explore Charts tab
  const renderExploreChartsTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h2
          className={
            isDark
              ? 'text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-6'
              : 'text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent mb-6'
          }
          >
            Explore Charts
          </h2>
          {/* 4-Grid Chart Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gridCharts.map((chart) => (
              <div key={chart.id} className={`rounded-2xl shadow-xl border transition-all duration-300 backdrop-blur-sm ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                {chart.isConfigured ? (
                  <>
                    {/* Chart Header with Options */}
                    <div className={`flex justify-between items-center p-4 border-b transition-colors duration-300 ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <h3 className={`text-lg font-semibold truncate transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {variableNames[chart.xAxis]} vs {variableNames[chart.yAxis]}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {/* AI Insights Button */}
                        <button
                          onClick={() => handleViewAIInsights(chart.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                            isDark 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
                              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                          } transform hover:scale-105 shadow-lg`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                          <span>AI Insights</span>
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === chart.id ? null : chart.id);
                            }}
                            className={`p-2 rounded-lg transition-all duration-300 dropdown-toggle ${
                              isDark 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01"/>
                            </svg>
                          </button>
                          
                          {activeDropdown === chart.id && (
                            <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border z-50 dropdown-menu transition-all duration-300 ${
                              isDark 
                                ? 'bg-gray-800 border-gray-600' 
                                : 'bg-white border-gray-200'
                            }`} onClick={(e) => e.stopPropagation()}>
                              <div className="py-2">
                                <button
                                  onClick={() => handleEditChart(chart.id)}
                                  className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${
                                    isDark 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                  Edit Chart
                                </button>
                                <button
                                  onClick={() => handleCustomizeChart(chart.id)}
                                  className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${
                                    isDark 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                                  </svg>
                                  Customize Style
                                </button>
                                <button
                                  onClick={() => handleDeleteChart(chart.id)}
                                  className={`w-full px-4 py-3 text-left text-sm flex items-center transition-colors duration-300 ${
                                    isDark 
                                      ? 'text-red-400 hover:bg-gray-700' 
                                      : 'text-red-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
                            xaxis: { 
                              title: { 
                                text: variableNames[chart.xAxis], 
                                font: { size: 12, color: isDark ? '#9ca3af' : '#6b7280' } 
                              },
                              gridcolor: isDark ? '#374151' : '#f3f4f6',
                              linecolor: isDark ? '#4b5563' : '#e5e7eb',
                              tickfont: { color: isDark ? '#9ca3af' : '#6b7280' }
                            },
                            yaxis: { 
                              title: { 
                                text: variableNames[chart.yAxis], 
                                font: { size: 12, color: isDark ? '#9ca3af' : '#6b7280' } 
                              },
                              gridcolor: isDark ? '#374151' : '#f3f4f6',
                              linecolor: isDark ? '#4b5563' : '#e5e7eb',
                              tickfont: { color: isDark ? '#9ca3af' : '#6b7280' }
                            },
                            showlegend: false,
                            margin: { t: 20, r: 20, b: 50, l: 70 },
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
                              filename: "chart",
                              height: 800,
                              width: 1200,
                              scale: 1
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Add Chart Placeholder
                  <div 
                    onClick={() => handleAddChart(chart.id)}
                    className={`h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                      isDark 
                        ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg ${
                      isDark 
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                    </div>
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      isDark 
                        ? 'text-gray-300 group-hover:text-blue-400' 
                        : 'text-gray-600 group-hover:text-blue-600'
                    }`}>Add Chart</h3>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${
                      isDark 
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
              <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                {/* Modal Header */}
                <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark 
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-blue-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>AI Insights</h3>
                      {activeInsightChartId && (
                        <p className={`text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {(() => {
                            const chart = gridCharts.find(c => c.id === activeInsightChartId);
                            return chart ? `${variableNames[chart.xAxis]} vs ${variableNames[chart.yAxis]}` : '';
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIInsightsModal(false)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Loading Animation */}
                  <div className={`mb-6 p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800/30' 
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Analyzing chart data with AI...
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                    </div>
                    <p className={`text-xs text-center transition-colors duration-300 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Processing patterns and generating insights...
                    </p>
                  </div>

                  {/* AI Insights List */}
                  <div className="space-y-4">
                    {getAIInsights().map((insight, index) => (
                      <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                        isDark 
                          ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500' 
                          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300'
                      }`}>
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                            isDark 
                              ? 'bg-gray-600' 
                              : 'bg-white shadow-sm'
                          }`}>
                            {insight.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {insight.title}
                            </h4>
                            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {insight.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setShowAIInsightsModal(false)}
                      className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${
                        isDark 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        console.log('Exporting insights...');
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Export Insights
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chart Configuration Modal */}
          {showConfigModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
              <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Configure Chart</h3>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Chart Type */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Chart Type</label>
                    <select 
                      className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500' 
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-200`}
                      value={tempConfig.chartType}
                      onChange={(e) => setTempConfig({...tempConfig, chartType: e.target.value})}
                    >
                      <option value="scatter">Scatter Plot</option>
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="histogram">Histogram</option>
                    </select>
                  </div>

                  {/* X-Axis */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>X-Axis Variable</label>
                    <select 
                      className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500' 
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-200`}
                      value={tempConfig.xAxis}
                      onChange={(e) => setTempConfig({...tempConfig, xAxis: e.target.value})}
                    >
                      {Object.entries(variableNames).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Y-Axis */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Y-Axis Variable</label>
                    <select 
                      className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500' 
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500'
                      } focus:ring-2 focus:ring-purple-200`}
                      value={tempConfig.yAxis}
                      onChange={(e) => setTempConfig({...tempConfig, yAxis: e.target.value})}
                    >
                      {Object.entries(variableNames).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Color Scheme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <button
                          key={key}
                          onClick={() => setTempConfig({...tempConfig, colorScheme: key})}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            tempConfig.colorScheme === key
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : isDark 
                                ? 'border-gray-600 hover:border-gray-500' 
                                : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`w-full h-6 rounded-lg mb-2 bg-gradient-to-r ${scheme.gradient}`}></div>
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>{scheme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Insights Toggle */}
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-bold transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Show AI Insights</label>
                    <button
                      onClick={() => setTempConfig({...tempConfig, showInsights: !tempConfig.showInsights})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        tempConfig.showInsights ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          tempConfig.showInsights ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${
                      isDark 
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
              <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 transition-all duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Customize Style</h3>
                  <button
                    onClick={() => setShowCustomizeModal(false)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Color Schemes */}
                  <div>
                    <label className={`block text-sm font-bold mb-4 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Choose Color Palette</label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <button
                          key={key}
                          onClick={() => setTempConfig({...tempConfig, colorScheme: key})}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                            tempConfig.colorScheme === key
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
                            <span className={`font-semibold transition-colors duration-300 ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>{scheme.name}</span>
                            {tempConfig.colorScheme === key && (
                              <div className="flex items-center mt-1">
                                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                <span className="text-xs text-green-600">Selected</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors Section */}
                  {tempConfig.colorScheme === 'custom' && (
                    <div>
                      <label className={`block text-sm font-bold mb-4 transition-colors duration-300 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>Custom Colors</label>
                      <div className="grid grid-cols-1 gap-4">
                        {/* Primary */}
                        <div className="w-full">
                          <label className={`text-xs font-medium mb-2 block transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Primary</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={tempConfig.customColors?.primary || '#3b82f6'}
                              onChange={(e) => setTempConfig({
                                ...tempConfig,
                                customColors: {
                                  ...tempConfig.customColors,
                                  primary: e.target.value,
                                },
                              })}
                              className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={tempConfig.customColors?.primary || '#3b82f6'}
                              onChange={(e) => setTempConfig({
                                ...tempConfig,
                                customColors: {
                                  ...tempConfig.customColors,
                                  primary: e.target.value,
                                },
                              })}
                              className={`w-full text-xs px-2 py-2 rounded border transition-all duration-300 ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Secondary */}
                        <div className="w-full">
                          <label className={`text-xs font-medium mb-2 block transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Secondary</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={tempConfig.customColors?.secondary || '#8b5cf6'}
                              onChange={(e) => setTempConfig({
                                ...tempConfig,
                                customColors: {
                                  ...tempConfig.customColors,
                                  secondary: e.target.value,
                                },
                              })}
                              className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={tempConfig.customColors?.secondary || '#8b5cf6'}
                              onChange={(e) => setTempConfig({
                                ...tempConfig,
                                customColors: {
                                  ...tempConfig.customColors,
                                  secondary: e.target.value,
                                },
                              })}
                              className={`w-full text-xs px-2 py-2 rounded border transition-all duration-300 ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Accent */}
                        <div className="w-full">
                          <label className={`text-xs font-medium mb-2 block transition-colors duration-300 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Accent</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={tempConfig.customColors?.accent || '#06d6a0'}
                              onChange={(e) => setTempConfig({
                                ...tempConfig,
                                customColors: {
                                  ...tempConfig.customColors,
                                  accent: e.target.value,
                                },
                              })}
                              className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={tempConfig.customColors?.accent || ''}
                              placeholder="#RRGGBB"
                              onChange={(e) => setTempConfig({
                                ...tempConfig,
                                customColors: {
                                  ...tempConfig.customColors,
                                  accent: e.target.value,
                                },
                              })}
                              className={`w-full text-xs px-2 py-2 rounded border transition-all duration-300 ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className={`p-4 rounded-xl transition-all duration-300 ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-bold mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
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
                    onClick={() => setShowCustomizeModal(false)}
                    className={`flex-1 px-6 py-3 border-2 rounded-xl transition-all duration-300 ${
                      isDark 
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
                    Apply Style
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 'advisorPortfolio':
        return renderPortfolioTab();
      case 'advisorAnalytics':
        return renderAnalyticsTab();
      case 'advisorReports':
        return renderReportsTab();
      case 'advisorTools':
        return renderToolsTab();
      case 'advisorExploreCharts':
        return renderExploreChartsTab();
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