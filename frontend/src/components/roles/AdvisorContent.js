'use client';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function AdvisorContent({ activeTab }) {
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

        {/* Client List */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">JS</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">John Smith</p>
                        <p className="text-sm text-gray-500">Age 45</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$185,400</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+9.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nov 15, 2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-green-600 hover:text-green-700 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-700">Edit</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium text-sm">MJ</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Mary Johnson</p>
                        <p className="text-sm text-gray-500">Age 38</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$92,750</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+6.8%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Low</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-500">Oct 2, 2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-green-600 hover:text-green-700 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-700">Edit</button>
                  </td>
                </tr>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
            <div className="h-80">
              <Plot
                data={[
                  {
                    x: ['0-5%', '5-10%', '10-15%', '15%+'],
                    y: [23, 89, 102, 33],
                    type: 'bar',
                    marker: { color: '#10b981' },
                    name: 'Number of Clients'
                  }
                ]}
                layout={{
                  title: 'Client Performance Distribution',
                  xaxis: { title: 'Performance Range' },
                  yaxis: { title: 'Number of Clients' },
                  showlegend: false,
                  margin: { t: 50, r: 20, b: 50, l: 50 }
                }}
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Allocation</h3>
            <div className="h-80">
              <Plot
                data={[
                  {
                    labels: ['Conservative', 'Moderate', 'Aggressive'],
                    values: [35, 45, 20],
                    type: 'pie',
                    marker: { colors: ['#10b981', '#f59e0b', '#ef4444'] }
                  }
                ]}
                layout={{
                  title: 'Risk Profile Distribution',
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.2 },
                  margin: { t: 50, r: 20, b: 80, l: 20 }
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
}
