'use client';

import { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

export default function MemberContent({ activeTab }) {
  const renderUploadTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Upload & Preprocessing</h2>
        
        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Pension Data</h3>
            <p className="text-gray-600 mb-4">Drag and drop your CSV, Excel, or JSON files here</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Files
            </button>
            <p className="text-sm text-gray-500 mt-2">Supported formats: CSV, XLSX, JSON (Max 50MB)</p>
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
            <span className="text-sm text-gray-500">Sample: pension_data.csv (1,247 rows)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contribution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">M001</td>
                  <td className="px-4 py-3 text-sm text-gray-900">34</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$65,000</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$520</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$45,200</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Medium</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Full-time</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">M002</td>
                  <td className="px-4 py-3 text-sm text-gray-900">28</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$52,000</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$416</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$28,900</td>
                  <td className="px-4 py-3 text-sm text-gray-900">High</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Full-time</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">M003</td>
                  <td className="px-4 py-3 text-sm text-gray-900">45</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$78,000</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$624</td>
                  <td className="px-4 py-3 text-sm text-gray-900">$127,450</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Low</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Part-time</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Clean & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChartsTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Chart Builder</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Axis Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Configuration</h3>
              
              {/* X-Axis Drop Zone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                  <div className="text-blue-600 font-medium">Age</div>
                  <div className="text-xs text-gray-500 mt-1">Drop field here</div>
                </div>
              </div>
              
              {/* Y-Axis Drop Zone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                  <div className="text-blue-600 font-medium">Balance</div>
                  <div className="text-xs text-gray-500 mt-1">Drop field here</div>
                </div>
              </div>
              
              {/* Chart Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Scatter Plot</option>
                  <option>Bar Chart</option>
                  <option>Line Chart</option>
                  <option>Histogram</option>
                </select>
              </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex space-x-2">
                    <input type="number" placeholder="Min" defaultValue="25" className="flex-1 border border-gray-300 rounded-lg px-3 py-2"/>
                    <input type="number" placeholder="Max" defaultValue="65" className="flex-1 border border-gray-300 rounded-lg px-3 py-2"/>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>All Levels</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>All Types</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Export Chart
                </button>
              </div>
              <div className="h-80">
                <Plot
                  data={[
                    {
                      x: [25, 28, 32, 34, 38, 42, 45, 48, 52, 55, 58, 62],
                      y: [15000, 28900, 42000, 45200, 67000, 89000, 127450, 156000, 198000, 234000, 267000, 312000],
                      type: 'scatter',
                      mode: 'markers',
                      marker: { color: '#3b82f6', size: 8 },
                      name: 'Age vs Balance'
                    }
                  ]}
                  layout={{
                    title: 'Age vs Pension Balance',
                    xaxis: { title: 'Age (years)' },
                    yaxis: { title: 'Balance ($)' },
                    showlegend: false,
                    margin: { t: 50, r: 20, b: 50, l: 80 }
                  }}
                  style={{ width: '100%', height: '100%' }}
                  config={{ displayModeBar: false }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Insights Assistant</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Suggested Prompts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Questions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="font-medium text-gray-900">Find 3 key insights</div>
                  <div className="text-sm text-gray-600">Analyze the data for patterns</div>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="font-medium text-gray-900">Explain savings trends</div>
                  <div className="text-sm text-gray-600">Show how savings change with age</div>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="font-medium text-gray-900">Risk analysis</div>
                  <div className="text-sm text-gray-600">Compare risk levels and returns</div>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="font-medium text-gray-900">Retirement readiness</div>
                  <div className="text-sm text-gray-600">Assess member preparedness</div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-sm text-gray-600">Ask questions about your pension data</p>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* AI Message */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                    <p className="text-gray-900">Hello! I&apos;m your AI assistant. I can help you analyze your pension data and provide insights. What would you like to know?</p>
                  </div>
                </div>
                
                {/* User Message */}
                <div className="flex space-x-3 justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-3 max-w-md">
                    <p>What are the key trends in our pension data?</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                    <p className="text-gray-900 mb-3">Based on your pension data analysis, here are 3 key insights:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Members aged 35-45 show the highest contribution rates, averaging $580/month</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>High-risk portfolios outperform by 2.3% annually but show 40% more volatility</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Part-time employees contribute 35% less but maintain similar risk preferences</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button className="text-blue-600 text-sm hover:text-blue-700">Download Summary Report</button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input type="text" placeholder="Ask a question about your pension data..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Summary Report</h3>
            <p className="text-gray-600 text-sm mb-4">Complete analysis of your pension data with key metrics and insights</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Export PDF
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Charts & Visualizations</h3>
            <p className="text-gray-600 text-sm mb-4">Export all your custom charts and data visualizations</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Export Images
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw Data Export</h3>
            <p className="text-gray-600 text-sm mb-4">Download processed data in CSV or Excel format</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
