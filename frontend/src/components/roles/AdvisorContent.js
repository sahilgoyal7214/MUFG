'use client';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import { useEffect, useState } from 'react';

function ChatbotAssistant() {
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

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
      <div style={{ display: open ? 'block' : 'none', width: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Chatbot Assistant</div>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.from === 'bot' ? 'left' : 'right', marginBottom: 4 }}>
              <span style={{ background: msg.from === 'bot' ? '#f3f4f6' : '#d1fae5', padding: '6px 12px', borderRadius: 8 }}>{msg.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          <input
            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: 6, marginRight: 4 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type your message..."
          />
          <button style={{ background: '#10b981', color: '#fff', borderRadius: 8, padding: '6px 12px', fontWeight: 600 }} onClick={handleSend}>Send</button>
        </div>
      </div>
      <button
        style={{ background: '#047857', color: '#fff', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 28, border: 'none', cursor: 'pointer' }}
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

export default function AdvisorContent({ activeTab }) {
  const [clients, setClients] = useState([]);
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
            <h3 className="text-lg font-semibold text-gray-900">Client Overview</h3>
            <div className="flex space-x-2">
              <input type="text" placeholder="Search clients..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Add Client
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Savings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Tolerance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retirement Age Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                          const reportHtml = `<!DOCTYPE html><html><head><title>Client Report</title><style>body{font-family:sans-serif;padding:2rem;}h2{color:#047857;}table{width:100%;border-collapse:collapse;}th,td{padding:8px 12px;border-bottom:1px solid #eee;}th{background:#f3f4f6;text-align:left;}tr:last-child td{border-bottom:none;}tr:nth-child(even){background:#f9fafb;}@media(max-width:600px){table,th,td{font-size:12px;}}</style></head><body><h2>Client Report</h2><table><tbody>${Object.entries(client).filter(([k]) => !['Initials','InitialsColor','InitialsText'].includes(k)).map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join('')}</tbody></table></body></html>`;
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
            <input type="text" placeholder="Search clients..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              Add Client
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Tolerance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retirement Age Goal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        // ...existing report logic...
                        const reportHtml = `<!DOCTYPE html><html><head><title>Client Report</title><style>body{font-family:sans-serif;padding:2rem;}h2{color:#047857;}table{width:100%;border-collapse:collapse;}th,td{padding:8px 12px;border-bottom:1px solid #eee;}th{background:#f3f4f6;text-align:left;}tr:last-child td{border-bottom:none;}tr:nth-child(even){background:#f9fafb;}@media(max-width:600px){table,th,td{font-size:12px;}}.tab{display:inline-block;padding:8px 24px;margin-right:8px;border-radius:8px;cursor:pointer;background:#f3f4f6;color:#047857;font-weight:600;} .tab.active{background:#047857;color:#fff;} .tab-content{margin-top:24px;}</style><script>function showTab(tab){document.getElementById('tab-report').style.display=tab==='report'?'block':'none';document.getElementById('tab-transactions').style.display=tab==='transactions'?'block':'none';document.getElementById('tab-btn-report').classList.toggle('active',tab==='report');document.getElementById('tab-btn-transactions').classList.toggle('active',tab==='transactions');}</script></head><body><h2>Client Report</h2><div><span id='tab-btn-report' class='tab active' onclick='showTab("report")'>Full Report</span><span id='tab-btn-transactions' class='tab' onclick='showTab("transactions")'>Transaction History</span></div><div id='tab-report' class='tab-content'><table><tbody>${Object.entries(client).filter(([k]) => !['Initials','InitialsColor','InitialsText'].includes(k)).map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`).join('')}</tbody></table></div><div id='tab-transactions' class='tab-content' style='display:none;'><table><thead><tr><th>Date</th><th>Transaction ID</th><th>Amount</th><th>Channel</th></tr></thead><tbody><tr><td>${client.Transaction_Date}</td><td>${client.Transaction_ID}</td><td>${client.Transaction_Amount}</td><td>${client.Transaction_Channel}</td></tr></tbody></table></div></body></html>`;
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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
                <input type="number" defaultValue="35" className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retirement Age</label>
                <input type="number" defaultValue="65" className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution</label>
                <input type="number" defaultValue="500" className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Return (%)</label>
                <input type="number" defaultValue="7" step="0.1" className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
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
      default:
        return renderPortfolioTab();
    }
  };

  return (
    <>
      {renderContent()}
      <ChatbotAssistant />
    </>
  );
}
