'use client';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function RegulatorContent({ activeTab }) {
  const renderComplianceTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance & Oversight Dashboard</h2>
        
        {/* Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Schemes</p>
            <p className="text-2xl font-bold text-gray-900">1,247</p>
            <p className="text-sm text-blue-600">Under supervision</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
            <p className="text-2xl font-bold text-gray-900">94.2%</p>
            <p className="text-sm text-green-600">Above target</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
            <p className="text-2xl font-bold text-gray-900">73</p>
            <p className="text-sm text-orange-600">Requires attention</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-red-600">High priority</p>
          </div>
        </div>

        {/* Compliance Issues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Compliance Issues</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-900">ABC Pension Scheme</p>
                  <p className="text-sm text-red-700">Missing quarterly filings - 15 days overdue</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                  Investigate
                </button>
                <button className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50">
                  Contact
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-yellow-900">XYZ Corporate Plan</p>
                  <p className="text-sm text-yellow-700">Risk concentration above threshold - 85% in single asset class</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700">
                  Review
                </button>
                <button className="px-3 py-1 text-sm border border-yellow-600 text-yellow-600 rounded hover:bg-yellow-50">
                  Monitor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Performance Trends</h3>
            <div className="h-80">
              <Plot
                data={[
                  {
                    x: ['Q1', 'Q2', 'Q3', 'Q4'],
                    y: [6.2, 7.8, 5.9, 8.1],
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { color: '#dc2626' },
                    marker: { color: '#dc2626' },
                    name: 'Average Performance (%)'
                  }
                ]}
                layout={{
                  title: 'Quarterly Performance Trends',
                  xaxis: { title: 'Quarter' },
                  yaxis: { title: 'Performance (%)' },
                  showlegend: false,
                  margin: { t: 50, r: 20, b: 50, l: 50 }
                }}
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Score Distribution</h3>
            <div className="h-80">
              <Plot
                data={[
                  {
                    x: ['90-100%', '80-89%', '70-79%', '<70%'],
                    y: [1175, 52, 15, 5],
                    type: 'bar',
                    marker: { color: ['#10b981', '#f59e0b', '#f97316', '#dc2626'] },
                    name: 'Number of Schemes'
                  }
                ]}
                layout={{
                  title: 'Compliance Score Distribution',
                  xaxis: { title: 'Compliance Score Range' },
                  yaxis: { title: 'Number of Schemes' },
                  showlegend: false,
                  margin: { t: 50, r: 20, b: 50, l: 50 }
                }}
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Regulatory Reports</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Export All Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
              <h4 className="font-semibold text-gray-900 mb-2">Quarterly Compliance Report</h4>
              <p className="text-sm text-gray-600 mb-4">Comprehensive compliance status across all supervised schemes</p>
              <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                Generate Report
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
              <h4 className="font-semibold text-gray-900 mb-2">Risk Assessment Summary</h4>
              <p className="text-sm text-gray-600 mb-4">Industry-wide risk analysis and recommendations</p>
              <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                Generate Report
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
              <h4 className="font-semibold text-gray-900 mb-2">Performance Benchmarks</h4>
              <p className="text-sm text-gray-600 mb-4">Industry performance metrics and comparisons</p>
              <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Audits & Reviews</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Audits</h3>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
              Schedule New Audit
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheme Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Global Corp Pension</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Compliance Review</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 15, 2024</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">High</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-red-600 hover:text-red-700 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-700">Edit</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">TechStart Retirement</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Financial Audit</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nov 30, 2024</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Medium</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-red-600 hover:text-red-700 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-700">Report</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Alerts</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">Critical Risk Alert</h3>
                <p className="text-red-700 mt-1">Metropolitan Pension Fund has exceeded risk concentration limits with 90% allocation in single equity position.</p>
                <div className="mt-4 flex space-x-3">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Immediate Action Required
                  </button>
                  <button className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                    Contact Scheme
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">Medium Risk Alert</h3>
                <p className="text-yellow-700 mt-1">Sunrise Industries Pension has been underperforming benchmark by 3.2% for consecutive quarters.</p>
                <div className="mt-4 flex space-x-3">
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                    Schedule Review
                  </button>
                  <button className="border border-yellow-600 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors text-sm">
                    Monitor Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">Information Notice</h3>
                <p className="text-blue-700 mt-1">New regulatory guidelines for ESG reporting will take effect January 2025. All schemes must comply by Q2 2025.</p>
                <div className="mt-4 flex space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    View Guidelines
                  </button>
                  <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                    Send Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'regulatorCompliance':
      return renderComplianceTab();
    case 'regulatorReports':
      return renderReportsTab();
    case 'regulatorAudits':
      return renderAuditsTab();
    case 'regulatorAlerts':
      return renderAlertsTab();
    default:
      return renderComplianceTab();
  }
}