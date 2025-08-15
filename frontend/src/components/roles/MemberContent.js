  'use client';

  import { useEffect, useRef, useState } from 'react';
  import dynamic from 'next/dynamic';

  const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

  export default function MemberContent({ activeTab }) {
    // State for chart configuration
    const [chartConfig, setChartConfig] = useState({
      xAxis: 'age',
      yAxis: 'projected_pension_amount',
      chartType: 'scatter'
    });

    // State for managing multiple charts in the grid
    const [gridCharts, setGridCharts] = useState([
      { // Default chart in first position
        id: 1,
        xAxis: 'age',
        yAxis: 'projected_pension_amount',
        chartType: 'scatter',
        isConfigured: true
      },
      { id: 2, isConfigured: false }
    ]);


    

    // State for chart configuration modal
    const [showConfigModal, setShowConfigModal] = useState(false);

    const [editingChartId, setEditingChartId] = useState(null);
    const [tempConfig, setTempConfig] = useState({
      xAxis: 'age',
      yAxis: 'projected_pension_amount',
      chartType: 'scatter'
    });

    // State for dropdown menus
    const [activeDropdown, setActiveDropdown] = useState(null);
    
    

    // Sample data for different variables
    const sampleData = {
      age: [25, 28, 32, 34, 38, 42, 45, 48, 52, 55, 58, 62, 35, 29, 41, 47, 53, 31, 44, 50],
      annual_income: [45000, 52000, 68000, 65000, 78000, 85000, 92000, 95000, 110000, 115000, 125000, 135000, 72000, 55000, 88000, 98000, 118000, 61000, 91000, 105000],
      current_savings: [15000, 28000, 45000, 42000, 67000, 89000, 127000, 156000, 198000, 234000, 267000, 312000, 58000, 31000, 98000, 145000, 187000, 38000, 112000, 168000],
      contribution_amount: [360, 416, 544, 520, 624, 680, 736, 760, 880, 920, 1000, 1080, 576, 440, 704, 784, 944, 488, 728, 840],
      retirement_age_goal: [65, 65, 67, 65, 67, 65, 62, 60, 62, 65, 67, 65, 67, 65, 62, 60, 62, 65, 65, 62],
      years_contributed: [3, 6, 10, 12, 16, 20, 23, 26, 30, 33, 36, 40, 13, 7, 19, 25, 31, 9, 22, 28],
      annual_return_rate: [0.07, 0.085, 0.065, 0.075, 0.08, 0.055, 0.06, 0.05, 0.055, 0.06, 0.065, 0.05, 0.075, 0.09, 0.06, 0.05, 0.055, 0.085, 0.07, 0.055],
      projected_pension_amount: [450000, 620000, 780000, 920000, 1100000, 1350000, 1580000, 1750000, 1920000, 2100000, 2280000, 2450000, 850000, 580000, 1250000, 1650000, 1850000, 720000, 1420000, 1780000],
      inflation_adjusted_payout: [385000, 527000, 663000, 782000, 935000, 1148000, 1343000, 1488000, 1632000, 1785000, 1938000, 2083000, 723000, 493000, 1063000, 1403000, 1573000, 612000, 1207000, 1513000],
      years_of_payout: [20, 22, 18, 20, 18, 20, 23, 25, 23, 20, 18, 20, 18, 20, 23, 25, 23, 20, 20, 23],
      account_age: [3, 6, 10, 12, 16, 20, 23, 26, 30, 33, 36, 40, 13, 7, 19, 25, 31, 9, 22, 28],
      total_annual_contribution: [4320, 4992, 6528, 6240, 7488, 8160, 8832, 9120, 10560, 11040, 12000, 12960, 6912, 5280, 8448, 9408, 11328, 5856, 8736, 10080]
    };

    // Variable display names
    const variableNames = {
      age: 'Age (years)',
      annual_income: 'Annual Income ($)',
      current_savings: 'Current Savings ($)',
      contribution_amount: 'Monthly Contribution ($)',
      retirement_age_goal: 'Retirement Age Goal',
      years_contributed: 'Years Contributed',
      annual_return_rate: 'Annual Return Rate (%)',
      projected_pension_amount: 'Projected Pension Amount ($)',
      inflation_adjusted_payout: 'Inflation Adjusted Payout ($)',
      years_of_payout: 'Years of Payout',
      account_age: 'Account Age (years)',
      total_annual_contribution: 'Total Annual Contribution ($)'
    };

    // Function to get chart data based on configuration
    const getChartData = (config) => {
      const xData = sampleData[config.xAxis];
      const yData = sampleData[config.yAxis];
      
      if (config.chartType === 'scatter') {
        return [{
          x: xData,
          y: yData,
          type: 'scatter',
          mode: 'markers',
          marker: { 
            color: ['#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#4cc9f0', '#7209b7', '#f77f00', '#fcbf49', '#003049', '#d62828', '#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#4cc9f0', '#7209b7', '#f77f00', '#fcbf49', '#003049', '#d62828'],
            size: 8,
            line: { color: 'white', width: 1 },
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
            color: '#3b82f6',
            opacity: 0.8
          },
          name: `${variableNames[config.xAxis]} vs ${variableNames[config.yAxis]}`
        }];
      } else if (config.chartType === 'line') {
        return [{
          x: xData,
          y: yData,
          type: 'scatter',
          mode: 'lines+markers',
          line: { color: '#3b82f6', width: 2 },
          marker: { size: 6, color: '#3b82f6' },
          name: `${variableNames[config.xAxis]} vs ${variableNames[config.yAxis]}`
        }];
      } else if (config.chartType === 'histogram') {
        return [{
          x: yData,
          type: 'histogram',
          marker: { color: '#3b82f6', opacity: 0.8 },
          name: `Distribution of ${variableNames[config.yAxis]}`
        }];
      }
    };

    // Handle opening config modal for new chart
    const handleAddChart = (chartId) => {
      setEditingChartId(chartId);
      setTempConfig({
        xAxis: 'age',
        yAxis: 'projected_pension_amount',
        chartType: 'scatter'
      });
      setShowConfigModal(true);
    };

    

    // Handle opening config modal for editing existing chart
    const handleEditChart = (chartId) => {
      const chart = gridCharts.find(c => c.id === chartId);
      setEditingChartId(chartId)
      setTempConfig({
        xAxis: chart.xAxis,
        yAxis: chart.yAxis,
        chartType: chart.chartType
      });
      setShowConfigModal(true);
      setActiveDropdown(null);
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

    return updated;
  });

  setShowConfigModal(false);
  setEditingChartId(null);
};


    // Handle deleting chart
    // Handle deleting chart (adjusts grid automatically)
const handleDeleteChart = (chartId) => {
  setGridCharts(prev => {
    // remove the chart from the array
    const updated = prev.filter(chart => chart.id !== chartId);

    // reassign IDs so layout is sequential
    const reIndexed = updated.map((chart, index) => ({
      ...chart,
      id: index + 1
    }));

    return reIndexed;
  });

  setActiveDropdown(null); // close the 3-dot menu
};

// Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (e) => {
    // If click is inside a dropdown menu or toggle button, do nothing
    if (e.target.closest('.dropdown-menu') || e.target.closest('.dropdown-toggle')) {
      return;
    }
    setActiveDropdown(null);
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);


    // Handle export chart (placeholder)
    const handleExportChart = (chartId) => {
      console.log(`Exporting chart ${chartId}`);
      setActiveDropdown(null);
    };

    // Close dropdown when clicking outside
 // Outside click handler
useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      e.target.closest(".dropdown-menu") || // inside menu
      e.target.closest(".dropdown-toggle")  // menu button
    ) {
      return; // don't close
    }
    setActiveDropdown(null);
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

    const renderChartsTab = () => (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Chart Builder Dashboard</h2>
          
          {/* 4-Grid Chart Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gridCharts.map((chart) => (
              <div key={chart.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm relative">
                {chart.isConfigured ? (
                  <>
                    {/* Chart Header with Options */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {variableNames[chart.xAxis]} vs {variableNames[chart.yAxis]}
                      </h3>
                      <div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setActiveDropdown(activeDropdown === chart.id ? null : chart.id);
    }}
    className="p-2 hover:bg-gray-100 rounded-lg transition-colors dropdown-toggle"
  >
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01"/>
    </svg>
  </button>
  
  {activeDropdown === chart.id && (
    <div
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 dropdown-menu"
      onClick={(e) => e.stopPropagation()} // ✅ prevent immediate close
    >
      <div className="py-2">
        <button
          onClick={() => handleEditChart(chart.id)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit Chart
        </button>
        <button
          onClick={() => handleDeleteChart(chart.id)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
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
                    
                    {/* Chart Content */}
                    <div className="p-4">
                      <div className="h-80 rounded-lg overflow-hidden">
                        <Plot
                          data={getChartData(chart)}
                          layout={{
                            config: {
                              responsive: true,
                              displayModeBar: false,
                              displaylogo: false,
                            },
                            xaxis: { 
                              title: { text: variableNames[chart.xAxis], font: { size: 12, color: '#6b7280' } },
                              gridcolor: '#f3f4f6',
                              linecolor: '#e5e7eb'
                            },
                            yaxis: { 
                              title: { text: variableNames[chart.yAxis], font: { size: 12, color: '#6b7280' } },
                              gridcolor: '#f3f4f6',
                              linecolor: '#e5e7eb'
                            },
                            showlegend: false,
                            margin: { t:20, r: 20, b: 50, l: 70 },
                            plot_bgcolor: '#fafafa',
                            paper_bgcolor: 'white',
                            font: { family: 'Inter, system-ui, sans-serif' }
                          }}
                          style={{ width: '100%', height: '100%' }}
                          config={{ 
  responsive: true,
  displayModeBar: true,    // ✅ show toolbar
  displaylogo: false,      // hides "Plotly" logo
  modeBarButtonsToRemove: ["sendDataToCloud"],
  toImageButtonOptions: {
    format: "png", // can be 'svg', 'jpeg', 'webp'
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
                    className="h-96 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">Add Chart</h3>
                    <p className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors mt-2">Click to configure a new chart</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chart Configuration Modal */}
          {showConfigModal && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-sm
   flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Configure Chart</h3>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Chart Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Chart Type</label>
                    <select 
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      value={tempConfig.chartType}
                      onChange={(e) => setTempConfig({...tempConfig, chartType: e.target.value})}
                    >
                      <option value="scatter">📊 Scatter Plot</option>
                      <option value="bar">📈 Bar Chart</option>
                      <option value="line">📉 Line Chart</option>
                      <option value="histogram">📊 Histogram</option>
                    </select>
                  </div>

                  {/* X-Axis */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">X-Axis Variable</label>
                    <select 
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                    <label className="block text-sm font-bold text-gray-700 mb-3">Y-Axis Variable</label>
                    <select 
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      value={tempConfig.yAxis}
                      onChange={(e) => setTempConfig({...tempConfig, yAxis: e.target.value})}
                    >
                      {Object.entries(variableNames).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
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
    );

    const renderUploadTab = () => (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Data Upload & Preprocessing</h2>
          
          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 backdrop-blur-sm">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Pension Data</h3>
              <p className="text-gray-600 mb-6">Drag and drop your CSV, Excel, or JSON files here</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Browse Files
              </button>
              <p className="text-sm text-gray-500 mt-3">Supported formats: CSV, XLSX, JSON (Max 50MB)</p>
            </div>
          </div>

          {/* Data Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Data Preview</h3>
              <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-sm font-medium">
                Sample: pension_data.csv (1,247 rows)
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Annual Income</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Current Savings</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contribution Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Investment Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Projected Pension</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">U001</td>
                    <td className="px-6 py-4 text-sm text-gray-900">34</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$65,000</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$45,200</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$520</td>
                    <td className="px-6 py-4 text-sm text-gray-900"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">Growth</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900">$1,245,000</td>
                  </tr>
                  <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">U002</td>
                    <td className="px-6 py-4 text-sm text-gray-900">28</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$52,000</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$28,900</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$416</td>
                    <td className="px-6 py-4 text-sm text-gray-900"><span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">Aggressive</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900">$985,000</td>
                  </tr>
                  <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">U003</td>
                    <td className="px-6 py-4 text-sm text-gray-900">45</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$78,000</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$127,450</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$624</td>
                    <td className="px-6 py-4 text-sm text-gray-900"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">Conservative</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900">$1,567,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Clean & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const renderAITab = () => (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">AI Insights Assistant</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Suggested Prompts */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  Smart Questions
                </h3>
                <div className="space-y-4">
                  <button className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all transform hover:scale-105 group">
                    <div className="font-bold text-gray-900 group-hover:text-blue-600 flex items-center">
                      📊 Find 3 key insights
                      <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Analyze pension data for patterns</div>
                  </button>
                  <button className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all transform hover:scale-105 group">
                    <div className="font-bold text-gray-900 group-hover:text-green-600 flex items-center">
                      📈 Explain savings trends
                      <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">How savings change with age & income</div>
                  </button>
                  <button className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all transform hover:scale-105 group">
                    <div className="font-bold text-gray-900 group-hover:text-red-600 flex items-center">
                      ⚠️ Risk analysis
                      <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Compare investment types and returns</div>
                  </button>
                  <button className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all transform hover:scale-105 group">
                    <div className="font-bold text-gray-900 group-hover:text-purple-600 flex items-center">
                      🎯 Retirement readiness
                      <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Assess member preparedness by age group</div>
                  </button>
                  <button className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all transform hover:scale-105 group">
                    <div className="font-bold text-gray-900 group-hover:text-indigo-600 flex items-center">
                      🌍 Geographic insights
                      <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Compare savings patterns by country</div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[600px] backdrop-blur-sm">
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">AI Pension Advisor</h3>
                      <p className="text-sm text-gray-600">Ask questions about your pension portfolio data</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* AI Welcome Message */}
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-gray-100 to-blue-50 rounded-2xl rounded-tl-md p-4 max-w-lg shadow-sm">
                      <p className="text-gray-900">👋 Hello! I'm your AI pension advisor. I can analyze your portfolio data across all dimensions including age, income, savings, contribution patterns, investment types, and geographic trends. What insights would you like to explore?</p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex space-x-4 justify-end">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-md p-4 max-w-lg shadow-lg">
                      <p>What are the key trends in our pension data across different age groups and investment types?</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-sm font-bold">👤</span>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div className="bg-gradient-to-r from-gray-100 to-blue-50 rounded-2xl rounded-tl-md p-4 max-w-lg shadow-sm">
                      <p className="text-gray-900 mb-4">📊 Based on your pension portfolio analysis, here are the key insights:</p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-xl shadow-sm">
                          <span className="text-blue-600 font-bold text-lg">1️⃣</span>
                          <div>
                            <div className="font-semibold text-gray-900">Peak Contributing Years (35-45)</div>
                            <div className="text-gray-600">Members in this age group show highest annual contributions averaging $6,200, with 68% choosing growth-oriented investments</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-xl shadow-sm">
                          <span className="text-green-600 font-bold text-lg">2️⃣</span>
                          <div>
                            <div className="font-semibold text-gray-900">Investment Performance by Type</div>
                            <div className="text-gray-600">Aggressive portfolios show 8.2% annual returns vs 5.8% conservative, but with 45% higher volatility risk</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-white rounded-xl shadow-sm">
                          <span className="text-purple-600 font-bold text-lg">3️⃣</span>
                          <div>
                            <div className="font-semibold text-gray-900">Geographic Savings Patterns</div>
                            <div className="text-gray-600">US members average $1.8M projected pension vs $1.2M globally, driven by higher contribution limits and employer matching</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                        <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                          📄 Export Report
                        </button>
                        <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                          📊 Create Chart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl">
                  <div className="flex space-x-4">
                    <input type="text" placeholder="Ask about contribution patterns, investment performance, geographic trends..." className="flex-1 border-2 border-gray-300 rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"/>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs border">
                      💰 Income vs Savings
                    </button>
                    <button className="px-3 py-1 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs border">
                      📈 Return Rates
                    </button>
                    <button className="px-3 py-1 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs border">
                      🌍 Country Comparison
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
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Export & Reports</h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 backdrop-blur-sm">
            <p className="text-gray-600 text-center">Export functionality coming soon...</p>
          </div>
        </div>
      </div>
    );

    // Main switch statement
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