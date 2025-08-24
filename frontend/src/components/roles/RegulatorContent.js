'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useChatbot } from '../../hooks/useApi';
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
        <div style={{ fontWeight: 600, marginBottom: 8, color: isDark ? '#f3f4f6' : '#111827' }}>Regulatory AI Assistant</div>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.from === 'bot' ? 'left' : 'right', marginBottom: 4 }}>
              <span style={{
                background: msg.from === 'bot'
                  ? (isDark ? '#374151' : '#f3f4f6')
                  : (isDark ? '#dc2626' : '#fee2e2'),
                color: msg.from === 'bot'
                  ? (isDark ? '#f3f4f6' : '#111827')
                  : (isDark ? '#fff' : '#dc2626'),
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
            placeholder="Ask about compliance..."
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
              background: '#dc2626',
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
          background: '#dc2626',
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
        {open ? '×' : '⚖️'}
      </button>
    </div>
  );
}

export default function RegulatorContent({ activeTab, isDark }) {
  console.log('🔥 RegulatorContent component rendered with activeTab:', activeTab);
  
  // Local state
  const [advisors, setAdvisors] = useState([]);
  const [members, setMembers] = useState([]);
  const [regulatorFlags, setRegulatorFlags] = useState([]);
  const [regulatorStats, setRegulatorStats] = useState({
    totalAdvisors: 0,
    totalMembers: 0,
    complianceRate: 0,
    flaggedAnomalies: 0,
    avgMemberSavings: 0,
    highRiskAdvisors: 0,
    criticalFlags: 0
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Risk alerts filter states
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Generate mock advisor data
  const generateMockAdvisorData = () => {
    const advisorData = [];
    const statuses = ['Compliant', 'Warning', 'Non-Compliant'];
    const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
    const names = [
      'Sarah Johnson', 'Michael Chen', 'David Smith', 'Emily Davis',
      'Robert Wilson', 'Lisa Anderson', 'James Thompson', 'Maria Garcia',
      'Christopher Lee', 'Jessica Taylor', 'Daniel Brown', 'Amanda White'
    ];
    
    for (let i = 1; i <= 50; i++) {
      const complianceScore = Math.random() * 100;
      const clientCount = Math.floor(Math.random() * 150) + 20;
      const aum = Math.floor(Math.random() * 50000000) + 5000000;
      const anomalyScore = Math.random();
      
      advisorData.push({
        Advisor_ID: `ADV${1000 + i}`,
        Name: names[Math.floor(Math.random() * names.length)],
        License_Number: `LIC${2000 + i}`,
        Compliance_Status: statuses[Math.floor(Math.random() * statuses.length)],
        Compliance_Score: Math.round(complianceScore),
        Risk_Level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
        Client_Count: clientCount,
        Assets_Under_Management: aum,
        Last_Audit_Date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        Anomaly_Score: Math.round(anomalyScore * 100) / 100,
        Transaction_Pattern_Score: Math.round(Math.random() * 100) / 100,
        Violations_Count: Math.floor(Math.random() * 5),
        Years_Licensed: Math.floor(Math.random() * 20) + 1,
        Office_Location: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol'][Math.floor(Math.random() * 5)],
        Specialization: ['Retirement Planning', 'Investment Advisory', 'Tax Planning', 'Estate Planning'][Math.floor(Math.random() * 4)]
      });
    }
    
    return advisorData;
  };

  // Generate mock member data (enhanced pension data)
  const generateMockMemberData = () => {
    const memberData = [];
    const genders = ['Male', 'Female'];
    const countries = ['UK', 'US', 'Canada', 'Australia'];
    const employmentStatuses = ['Employed', 'Self-Employed', 'Unemployed', 'Retired'];
    const riskTolerances = ['Low', 'Medium', 'High'];
    
    for (let i = 1; i <= 200; i++) {
      const age = Math.floor(Math.random() * 40) + 25;
      const annualIncome = Math.floor(Math.random() * 80000) + 30000;
      const currentSavings = Math.floor(Math.random() * 50000) + 5000;
      const anomalyScore = Math.random();
      const transactionPatternScore = Math.random();
      
      memberData.push({
        User_ID: i,
        Age: age,
        Gender: genders[Math.floor(Math.random() * genders.length)],
        Country: countries[Math.floor(Math.random() * countries.length)],
        Employment_Status: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
        Annual_Income: annualIncome,
        Current_Savings: currentSavings,
        Risk_Tolerance: riskTolerances[Math.floor(Math.random() * riskTolerances.length)],
        Projected_Pension_Amount: Math.floor(Math.random() * 1000000) + 100000,
        Anomaly_Score: Math.round(anomalyScore * 100) / 100,
        Transaction_Pattern_Score: Math.round(transactionPatternScore * 100) / 100,
        Suspicious_Flag: anomalyScore > 0.8 ? '1' : '0',
        Transaction_Amount: Math.floor(Math.random() * 10000) + 100,
        Monthly_Expenses: Math.floor(Math.random() * 3000) + 1500,
        Savings_Rate: Math.round((currentSavings / annualIncome) * 100 * 100) / 100
      });
    }
    
    return memberData;
  };

  // Generate mock regulatory flags
  const generateMockRegulatorFlags = () => {
    const flagTypes = ['High Transaction Volume', 'Unusual Pattern', 'Compliance Breach', 'Risk Threshold Exceeded'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Open', 'Under Investigation', 'Resolved', 'Escalated'];
    
    const flags = [];
    for (let i = 1; i <= 25; i++) {
      flags.push({
        Flag_ID: `FLAG${3000 + i}`,
        Entity_Type: Math.random() > 0.5 ? 'Advisor' : 'Member',
        Entity_ID: Math.random() > 0.5 ? `ADV${1000 + Math.floor(Math.random() * 50)}` : `U${Math.floor(Math.random() * 200) + 1}`,
        Flag_Type: flagTypes[Math.floor(Math.random() * flagTypes.length)],
        Severity: severities[Math.floor(Math.random() * severities.length)],
        Status: statuses[Math.floor(Math.random() * statuses.length)],
        Created_Date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        Description: 'Automated system detected anomalous activity requiring regulatory review.',
        Risk_Score: Math.round(Math.random() * 100) / 100
      });
    }
    
    return flags;
  };

  // Load data on component mount
  useEffect(() => {
    const loadRegulatorData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading regulatory data...');
        
        // Try to load real data, fall back to mock data
        try {
          // Attempt to load advisor data
          const advisorResponse = await apiService.getAdvisorKPIs();
          if (advisorResponse?.success && advisorResponse?.data) {
            console.log('✅ Loaded real advisor data');
          }
        } catch (advisorError) {
          console.log('⚠️ Failed to load real advisor data, using mock data');
        }

        // Generate mock data for demo
        setTimeout(() => {
          const mockAdvisors = generateMockAdvisorData();
          const mockMembers = generateMockMemberData();
          const mockFlags = generateMockRegulatorFlags();
          
          setAdvisors(mockAdvisors);
          setMembers(mockMembers);
          setRegulatorFlags(mockFlags);
          
          // Calculate stats
          const complianceCount = mockAdvisors.filter(a => a.Compliance_Status === 'Compliant').length;
          const highRiskAdvisorsCount = mockAdvisors.filter(a => a.Risk_Level === 'High' || a.Risk_Level === 'Critical').length;
          const criticalFlagsCount = mockFlags.filter(f => f.Severity === 'Critical').length;
          const avgSavings = mockMembers.reduce((sum, m) => sum + m.Current_Savings, 0) / mockMembers.length;
          
          setRegulatorStats({
            totalAdvisors: mockAdvisors.length,
            totalMembers: mockMembers.length,
            complianceRate: Math.round((complianceCount / mockAdvisors.length) * 100),
            flaggedAnomalies: mockFlags.length,
            avgMemberSavings: Math.round(avgSavings),
            highRiskAdvisors: highRiskAdvisorsCount,
            criticalFlags: criticalFlagsCount
          });
          
          setLoading(false);
          console.log('✅ Mock regulatory data loaded successfully');
        }, 1500);
        
      } catch (error) {
        console.error('❌ Error loading regulatory data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadRegulatorData();
  }, []);

  // Export functions
  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportHTML = generateAuditReport();
      const newWindow = window.open('', '_blank');
      newWindow.document.write(reportHTML);
      newWindow.document.close();
      newWindow.document.title = `Regulatory Audit Report - ${new Date().toLocaleDateString()}`;
      
      console.log('✅ PDF export initiated');
    } catch (error) {
      console.error('❌ PDF export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create CSV content
      const csvContent = generateCSVReport();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `regulatory-report-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Excel export completed');
    } catch (error) {
      console.error('❌ Excel export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPPT = async () => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const presentationHTML = generatePresentationReport();
      const newWindow = window.open('', '_blank');
      newWindow.document.write(presentationHTML);
      newWindow.document.close();
      newWindow.document.title = `Regulatory Presentation - ${new Date().toLocaleDateString()}`;
      
      console.log('✅ PowerPoint export initiated');
    } catch (error) {
      console.error('❌ PowerPoint export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Report generation functions
  const generateAuditReport = () => {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regulatory Audit Report</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .content {
            padding: 40px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: #f8fafc;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            border-left: 5px solid #dc2626;
        }
        .stat-value {
            font-size: 2em;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #64748b;
            font-weight: 500;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h3 {
            color: #dc2626;
            margin-bottom: 20px;
            font-size: 1.3em;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .table th {
            background: #dc2626;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .high-risk {
            background: #fef2f2;
            color: #dc2626;
            font-weight: 600;
        }
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>Regulatory Audit Report</h1>
            <p>Generated on ${reportDate} | MUFG Regulatory Compliance Platform</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${regulatorStats.totalAdvisors}</div>
                    <div class="stat-label">Total Advisors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${regulatorStats.complianceRate}%</div>
                    <div class="stat-label">Compliance Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${regulatorStats.flaggedAnomalies}</div>
                    <div class="stat-label">Flagged Anomalies</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${regulatorStats.criticalFlags}</div>
                    <div class="stat-label">Critical Flags</div>
                </div>
            </div>

            <div class="section">
                <h3>High-Risk Advisors</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Advisor ID</th>
                            <th>Name</th>
                            <th>Risk Level</th>
                            <th>Compliance Score</th>
                            <th>Client Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${advisors.filter(a => a.Risk_Level === 'High' || a.Risk_Level === 'Critical')
                          .slice(0, 10)
                          .map(advisor => `
                            <tr class="${advisor.Risk_Level === 'Critical' ? 'high-risk' : ''}">
                                <td>${advisor.Advisor_ID}</td>
                                <td>${advisor.Name}</td>
                                <td>${advisor.Risk_Level}</td>
                                <td>${advisor.Compliance_Score}%</td>
                                <td>${advisor.Client_Count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>MUFG Regulatory Compliance Platform</strong> | This report is confidential and for authorized personnel only.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const generateCSVReport = () => {
    let csv = 'Advisor_ID,Name,Risk_Level,Compliance_Score,Client_Count,AUM,Anomaly_Score\n';
    advisors.forEach(advisor => {
      csv += `${advisor.Advisor_ID},${advisor.Name},${advisor.Risk_Level},${advisor.Compliance_Score},${advisor.Client_Count},${advisor.Assets_Under_Management},${advisor.Anomaly_Score}\n`;
    });
    return csv;
  };

  const generatePresentationReport = () => {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regulatory Compliance Presentation</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #dc2626, #991b1b);
            color: white;
        }
        .slide {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto 40px;
            background: white;
            color: #333;
            border-radius: 20px;
            padding: 60px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            page-break-after: always;
        }
        .slide h1 {
            color: #dc2626;
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 30px;
        }
        .slide h2 {
            color: #dc2626;
            font-size: 1.8em;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin: 40px 0;
        }
        .metric {
            text-align: center;
            background: #f8fafc;
            padding: 30px;
            border-radius: 15px;
        }
        .metric-value {
            font-size: 3em;
            font-weight: bold;
            color: #dc2626;
        }
        .metric-label {
            font-size: 1.2em;
            color: #64748b;
            margin-top: 10px;
        }
        .risk-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .risk-table th,
        .risk-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        .risk-table th {
            background: #dc2626;
            color: white;
        }
        .critical-row {
            background: #fef2f2;
            color: #dc2626;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="slide">
        <h1>Regulatory Compliance Overview</h1>
        <p style="text-align: center; font-size: 1.2em; color: #64748b;">
            MUFG Pension Fund Regulatory Report<br>
            ${reportDate}
        </p>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${regulatorStats.totalAdvisors}</div>
                <div class="metric-label">Total Advisors</div>
            </div>
            <div class="metric">
                <div class="metric-value">${regulatorStats.complianceRate}%</div>
                <div class="metric-label">Compliance Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${regulatorStats.flaggedAnomalies}</div>
                <div class="metric-label">Flagged Anomalies</div>
            </div>
            <div class="metric">
                <div class="metric-value">${regulatorStats.criticalFlags}</div>
                <div class="metric-label">Critical Flags</div>
            </div>
        </div>
    </div>

    <div class="slide">
        <h2>High-Risk Advisor Analysis</h2>
        <table class="risk-table">
            <thead>
                <tr>
                    <th>Advisor</th>
                    <th>Risk Level</th>
                    <th>Compliance Score</th>
                    <th>Client Count</th>
                    <th>AUM</th>
                </tr>
            </thead>
            <tbody>
                ${advisors.filter(a => a.Risk_Level === 'High' || a.Risk_Level === 'Critical')
                  .slice(0, 8)
                  .map(advisor => `
                    <tr class="${advisor.Risk_Level === 'Critical' ? 'critical-row' : ''}">
                        <td>${advisor.Name}</td>
                        <td>${advisor.Risk_Level}</td>
                        <td>${advisor.Compliance_Score}%</td>
                        <td>${advisor.Client_Count}</td>
                        <td>$${(advisor.Assets_Under_Management / 1000000).toFixed(1)}M</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
  };

  // Tab rendering functions
  const renderComplianceOverview = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'}`}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Compliance Overview</h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Comprehensive regulatory monitoring and compliance tracking</p>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{regulatorStats.totalAdvisors}</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Advisors</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{regulatorStats.complianceRate}%</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Compliance Rate</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{regulatorStats.flaggedAnomalies}</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Flagged Anomalies</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{regulatorStats.totalMembers.toLocaleString()}</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* High-Risk Advisors */}
            <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6 border-b border-gray-200">
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>High-Risk Advisors</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {advisors.filter(a => a.Risk_Level === 'High' || a.Risk_Level === 'Critical').slice(0, 5).map((advisor, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                      advisor.Risk_Level === 'Critical' 
                        ? (isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200')
                        : (isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                    }`}>
                      <div>
                        <p className={`font-semibold transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{advisor.Name}</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>ID: {advisor.Advisor_ID}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          advisor.Risk_Level === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {advisor.Risk_Level}
                        </span>
                        <p className={`text-sm mt-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Score: {advisor.Compliance_Score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Flags */}
            <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6 border-b border-gray-200">
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Critical Regulatory Flags</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {regulatorFlags.filter(f => f.Severity === 'Critical' || f.Severity === 'High').slice(0, 5).map((flag, index) => (
                    <div key={index} className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-300 ${
                      flag.Severity === 'Critical'
                        ? (isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200')
                        : (isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200')
                    }`}>
                      <div className="flex-1">
                        <p className={`font-semibold transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{flag.Flag_Type}</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Entity: {flag.Entity_ID}</p>
                        <p className={`text-xs mt-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>{flag.Created_Date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        flag.Severity === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {flag.Severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Trend Chart */}
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-6 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Compliance Trends</h3>
            <div className="h-80">
              <Plot
                data={[
                  {
                    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    y: [92, 94, 91, 96, 93, 95],
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Compliance Rate (%)',
                    line: { color: '#dc2626', width: 3 },
                    marker: { size: 8, color: '#dc2626' }
                  },
                  {
                    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    y: [15, 12, 18, 8, 14, 10],
                    type: 'bar',
                    name: 'Flagged Anomalies',
                    marker: { color: '#f59e0b', opacity: 0.7 },
                    yaxis: 'y2'
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 60, r: 60, t: 40, b: 60 },
                  paper_bgcolor: isDark ? '#1f2937' : '#ffffff',
                  plot_bgcolor: isDark ? '#374151' : '#f9fafb',
                  font: { color: isDark ? '#f3f4f6' : '#111827' },
                  xaxis: { 
                    title: 'Month',
                    gridcolor: isDark ? '#4b5563' : '#e5e7eb'
                  },
                  yaxis: { 
                    title: 'Compliance Rate (%)',
                    gridcolor: isDark ? '#4b5563' : '#e5e7eb',
                    range: [80, 100]
                  },
                  yaxis2: {
                    title: 'Anomaly Count',
                    overlaying: 'y',
                    side: 'right',
                    gridcolor: 'transparent'
                  },
                  legend: { 
                    x: 0.02, 
                    y: 0.98,
                    bgcolor: isDark ? '#374151' : '#f9fafb',
                    bordercolor: isDark ? '#4b5563' : '#e5e7eb',
                    borderwidth: 1
                  }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvisorMonitoring = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'}`}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Advisor Monitoring</h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Real-time oversight of advisor compliance and risk profiles</p>
          </div>

          {/* Filter Controls */}
          <div className="flex space-x-4 mb-6">
            <select className={`border rounded-lg px-4 py-2 text-sm transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>All Risk Levels</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className={`border rounded-lg px-4 py-2 text-sm transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>All Compliance Status</option>
              <option>Compliant</option>
              <option>Warning</option>
              <option>Non-Compliant</option>
            </select>
            <input 
              type="text" 
              placeholder="Search advisors..." 
              className={`border rounded-lg px-4 py-2 text-sm transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`} 
            />
          </div>

          {/* Advisor Table */}
          <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Advisor</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Risk Level</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Compliance</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Clients</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>AUM</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Anomaly Score</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${
                  isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                }`}>
                  {advisors.slice(0, 15).map((advisor, index) => (
                    <tr key={index} className={`transition-colors duration-300 hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {advisor.Name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{advisor.Name}</div>
                            <div className={`text-sm transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>{advisor.Advisor_ID}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          advisor.Risk_Level === 'Critical' ? 'bg-red-100 text-red-800' :
                          advisor.Risk_Level === 'High' ? 'bg-orange-100 text-orange-800' :
                          advisor.Risk_Level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {advisor.Risk_Level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{advisor.Compliance_Score}%</div>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                advisor.Compliance_Score >= 90 ? 'bg-green-500' :
                                advisor.Compliance_Score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${advisor.Compliance_Score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {advisor.Client_Count}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        ${(advisor.Assets_Under_Management / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          advisor.Anomaly_Score > 0.8 ? 'bg-red-100 text-red-800' :
                          advisor.Anomaly_Score > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {advisor.Anomaly_Score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-red-600 hover:text-red-900 font-medium">Review</button>
                          <button className="text-gray-600 hover:text-gray-900 font-medium">Details</button>
                        </div>
                      </td>
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

  const renderMemberMonitoring = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'}`}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Member Monitoring</h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Aggregate statistics and anomaly detection across member portfolios</p>
          </div>

          {/* Member Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>${regulatorStats.avgMemberSavings.toLocaleString()}</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Avg Member Savings</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>${(members.reduce((sum, m) => sum + m.Projected_Pension_Amount, 0) / members.length / 1000).toFixed(0)}K</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Avg Projected Pension</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{members.filter(m => m.Suspicious_Flag === '1').length}</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Suspicious Members</p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{(members.reduce((sum, m) => sum + m.Savings_Rate, 0) / members.length).toFixed(1)}%</p>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Avg Savings Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Age Distribution */}
            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Member Age Distribution</h3>
              <div className="h-64">
                <Plot
                  data={[{
                    x: members.map(m => m.Age),
                    type: 'histogram',
                    nbinsx: 15,
                    marker: { color: '#dc2626', opacity: 0.8 },
                    name: 'Age Distribution'
                  }]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 40, t: 40, b: 40 },
                    paper_bgcolor: isDark ? '#1f2937' : '#ffffff',
                    plot_bgcolor: isDark ? '#374151' : '#f9fafb',
                    font: { color: isDark ? '#f3f4f6' : '#111827' },
                    xaxis: { title: 'Age', gridcolor: isDark ? '#4b5563' : '#e5e7eb' },
                    yaxis: { title: 'Count', gridcolor: isDark ? '#4b5563' : '#e5e7eb' }
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            {/* Savings vs Income */}
            <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Income vs Current Savings</h3>
              <div className="h-64">
                <Plot
                  data={[{
                    x: members.map(m => m.Annual_Income),
                    y: members.map(m => m.Current_Savings),
                    mode: 'markers',
                    type: 'scatter',
                    marker: { 
                      color: members.map(m => m.Anomaly_Score),
                      colorscale: 'Reds',
                      size: 6,
                      opacity: 0.7,
                      colorbar: {
                        title: 'Anomaly Score',
                        titlefont: { color: isDark ? '#f3f4f6' : '#111827' },
                        tickfont: { color: isDark ? '#f3f4f6' : '#111827' }
                      }
                    },
                    name: 'Members'
                  }]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 60, t: 40, b: 40 },
                    paper_bgcolor: isDark ? '#1f2937' : '#ffffff',
                    plot_bgcolor: isDark ? '#374151' : '#f9fafb',
                    font: { color: isDark ? '#f3f4f6' : '#111827' },
                    xaxis: { title: 'Annual Income', gridcolor: isDark ? '#4b5563' : '#e5e7eb' },
                    yaxis: { title: 'Current Savings', gridcolor: isDark ? '#4b5563' : '#e5e7eb' }
                  }}
                  config={{ displayModeBar: false }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* High-Risk Members Table */}
          <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>High-Risk Members (Anomaly Score &gt; 0.7)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Member ID</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Age</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Current Savings</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Annual Income</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Anomaly Score</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Suspicious Flag</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${
                  isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                }`}>
                  {members.filter(m => m.Anomaly_Score > 0.7).slice(0, 10).map((member, index) => (
                    <tr key={index} className={`transition-colors duration-300 ${
                      member.Suspicious_Flag === '1' 
                        ? (isDark ? 'bg-red-900/30' : 'bg-red-50') 
                        : `hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`
                    }`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        M{member.User_ID.toString().padStart(3, '0')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {member.Age}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        ${member.Current_Savings.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        ${member.Annual_Income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.Anomaly_Score > 0.9 ? 'bg-red-100 text-red-800' :
                          member.Anomaly_Score > 0.8 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.Anomaly_Score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.Suspicious_Flag === '1' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {member.Suspicious_Flag === '1' ? 'Flagged' : 'Clear'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-red-600 hover:text-red-900 font-medium">Investigate</button>
                          <button className="text-gray-600 hover:text-gray-900 font-medium">Details</button>
                        </div>
                      </td>
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

  const renderAuditReports = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'}`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Audit Reports & Export</h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Generate comprehensive regulatory reports and compliance documentation</p>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 text-white text-2xl">
                📄
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Compliance Report</h3>
              <p className={`text-sm mb-4 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Generate comprehensive regulatory compliance reports with advisor oversight data</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">PDF</span>
                <button
                  onClick={exportToPDF}
                  disabled={exportLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 text-sm disabled:opacity-50"
                >
                  {exportLoading ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 text-white text-2xl">
                📊
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Data Export</h3>
              <p className={`text-sm mb-4 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Export detailed regulatory data for analysis and compliance tracking</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Excel</span>
                <button
                  onClick={exportToExcel}
                  disabled={exportLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 text-sm disabled:opacity-50"
                >
                  {exportLoading ? 'Exporting...' : 'Export Excel'}
                </button>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 text-white text-2xl">
                📋
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Executive Presentation</h3>
              <p className={`text-sm mb-4 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Create board-ready presentations with key regulatory findings and insights</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">PPT</span>
                <button
                  onClick={exportToPPT}
                  disabled={exportLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 text-sm disabled:opacity-50"
                >
                  {exportLoading ? 'Exporting...' : 'Export PPT'}
                </button>
              </div>
            </div>
          </div>

          {/* Report History */}
          <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Export History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { name: 'Q4_2024_Regulatory_Report.pdf', date: '2024-12-15', size: '4.2 MB', status: 'completed', type: 'PDF' },
                  { name: 'Advisor_Compliance_Data.xlsx', date: '2024-12-12', size: '2.8 MB', status: 'completed', type: 'Excel' },
                  { name: 'Board_Compliance_Presentation.pptx', date: '2024-12-10', size: '8.1 MB', status: 'completed', type: 'PPT' },
                  { name: 'Monthly_Anomaly_Report.pdf', date: '2024-12-08', size: '3.5 MB', status: 'completed', type: 'PDF' },
                  { name: 'Risk_Assessment_Summary.xlsx', date: '2024-12-05', size: '1.9 MB', status: 'completed', type: 'Excel' }
                ].map((file, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-300 ${
                    isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        file.type === 'PDF' ? 'bg-red-100 text-red-600' :
                        file.type === 'Excel' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {file.type === 'PDF' ? '📄' : file.type === 'Excel' ? '📊' : '📋'}
                      </div>
                      <div>
                        <h4 className={`font-medium transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{file.name}</h4>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>{file.date} • {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        file.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {file.status}
                      </span>
                      <button className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm transition-colors duration-300">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Scheduled Reports</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Weekly Compliance Summary</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Monthly Risk Assessment</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Quarterly Audit Report</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Report Templates</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors duration-300">
                  Standard Compliance Template
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors duration-300">
                  Risk Assessment Template
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors duration-300">
                  Executive Summary Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Risk Alerts Tab
  const renderRiskAlerts = () => {
    // Filter the flags based on severity and status filters
    const filteredFlags = regulatorFlags.filter(flag => {
      const matchesSeverity = severityFilter === 'All' || flag.Severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || flag.Status === statusFilter;
      return matchesSeverity && matchesStatus;
    });

    // Calculate alert stats
    const totalAlerts = regulatorFlags.length;
    const openAlerts = regulatorFlags.filter(f => f.Status === 'Open').length;
    const resolvedAlerts = regulatorFlags.filter(f => f.Status === 'Resolved').length;
    const escalatedAlerts = regulatorFlags.filter(f => f.Status === 'Escalated').length;

    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'
      }`}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Risk Alerts Dashboard</h1>
              <p className={`text-lg transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Monitor and manage regulatory risk alerts across all entities</p>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Alerts</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{totalAlerts}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Open Alerts</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{openAlerts}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Resolved Alerts</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{resolvedAlerts}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Escalated Alerts</p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{escalatedAlerts}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Alerts Table */}
            <div className={`rounded-xl shadow-lg border transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Table Header with Filters */}
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Recent Risk Alerts</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Severity Filter */}
                    <div className="flex items-center space-x-2">
                      <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Severity:</label>
                      <select 
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="All">All</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                      <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Status:</label>
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="All">All</option>
                        <option value="Open">Open</option>
                        <option value="Under Investigation">Under Investigation</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Escalated">Escalated</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`transition-colors duration-300 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Flag ID</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Entity</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Type</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Severity</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Date</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDark ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {filteredFlags.map((flag, index) => (
                      <tr key={flag.Flag_ID} className={`transition-colors duration-300 hover:${
                        isDark ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {flag.Flag_ID}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          <div>
                            <div className="font-medium">{flag.Entity_Type}</div>
                            <div className="text-xs">{flag.Entity_ID}</div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {flag.Flag_Type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            flag.Severity === 'Critical' ? 'bg-red-100 text-red-800' :
                            flag.Severity === 'High' ? 'bg-orange-100 text-orange-800' :
                            flag.Severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {flag.Severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            flag.Status === 'Open' ? 'bg-red-100 text-red-800' :
                            flag.Status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' :
                            flag.Status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {flag.Status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {flag.Created_Date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200">
                              View
                            </button>
                            {flag.Status === 'Open' && (
                              <button className="text-green-600 hover:text-green-900 transition-colors duration-200">
                                Investigate
                              </button>
                            )}
                            {flag.Status === 'Under Investigation' && (
                              <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* No results message */}
              {filteredFlags.length === 0 && (
                <div className="text-center py-8">
                  <div className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>No alerts found</div>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Try adjusting your filters to see more results.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading component
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className={`text-xl font-semibold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Loading Regulatory Data...</h3>
          <p className={`transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Analyzing compliance and risk metrics</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-red-50'
      }`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Error Loading Data</h3>
          <p className={`mb-4 transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main content router
  const renderContent = () => {
    switch (activeTab) {
      case 'regulatorCompliance':
        return renderComplianceOverview();
      case 'regulatorReports':
        return renderAdvisorMonitoring();
      case 'regulatorAudits':
        return renderAuditReports();
      case 'regulatorAlerts':
        return renderRiskAlerts();
      // Legacy support for old tab names
      case 'compliance':
        return renderComplianceOverview();
      case 'advisors':
        return renderAdvisorMonitoring();
      case 'members':
        return renderMemberMonitoring();
      case 'audit':
        return renderAuditReports();
      default:
        return renderComplianceOverview();
    }
  };

  return (
    <>
      {renderContent()}
      <ChatbotAssistant isDark={isDark} />
    </>
  );
}