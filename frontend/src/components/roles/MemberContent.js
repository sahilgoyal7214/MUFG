'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function MemberContent({ activeTab, isDark, onToggleDark }) {
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
  ]);

  // State for chart configuration modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);
  const [activeInsightChartId, setActiveInsightChartId] = useState(null);
  const [editingChartId, setEditingChartId] = useState(null);
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

  // Sample AI insights
  const getAIInsights = (chart) => {
    return [
      {
        icon: '📈',
        title: 'Strong Positive Correlation',
        text: 'There is a strong positive correlation (r=0.87) between age and projected pension amount. Members who start contributing later in their careers show accelerated growth patterns.'
      },
      {
        icon: '💡',
        title: 'Optimization Opportunity',
        text: 'Members aged 35-45 show the highest potential for pension growth optimization. Consider targeted contribution increase campaigns for this demographic.'
      },
      {
        icon: '⚠️',
        title: 'Risk Factor',
        text: 'Members starting after age 45 may need additional retirement planning support to meet their goals. Early intervention recommended.'
      },
      {
        icon: '🎯',
        title: 'Performance Insight',
        text: 'The data shows that consistent contributors (regardless of amount) achieve 23% better outcomes than irregular contributors.'
      }
    ];
  };

  // Function to get chart data based on configuration
  const getChartData = (config) => {
    const xData = sampleData[config.xAxis];
    const yData = sampleData[config.yAxis];
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

  // Handle opening config modal for new chart
  const handleAddChart = (chartId) => {
    setEditingChartId(chartId);
    setTempConfig({
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
  const handleViewAIInsights = (chartId) => {
    setActiveInsightChartId(chartId);
    setShowAIInsightsModal(true);
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

  const renderChartsTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {renderHeader('Chart Builder Dashboard')}
          
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

                  {/* Custom Color Inputs */}
                  <div>
                    <label className={`block text-sm font-bold mb-4 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Fine-tune Colors</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
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
                                primary: e.target.value
                              }
                            })}
                            className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempConfig.customColors?.primary || '#3b82f6'}
                            onChange={(e) => setTempConfig({
                              ...tempConfig,
                              customColors: {
                                ...tempConfig.customColors,
                                primary: e.target.value
                              }
                            })}
                            className={`flex-1 text-xs px-2 py-2 rounded border transition-all duration-300 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                      <div>
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
                                secondary: e.target.value
                              }
                            })}
                            className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempConfig.customColors?.secondary || '#8b5cf6'}
                            onChange={(e) => setTempConfig({
                              ...tempConfig,
                              customColors: {
                                ...tempConfig.customColors,
                                secondary: e.target.value
                              }
                            })}
                            className={`flex-1 text-xs px-2 py-2 rounded border transition-all duration-300 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                      <div>
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
                                accent: e.target.value
                              }
                            })}
                            className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempConfig.customColors?.accent || '#06d6a0'}
                            onChange={(e) => setTempConfig({
                              ...tempConfig,
                              customColors: {
                                ...tempConfig.customColors,
                                accent: e.target.value
                              }
                            })}
                            className={`flex-1 text-xs px-2 py-2 rounded border transition-all duration-300 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

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

  const renderUploadTab = () => (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {renderHeader('Data Upload & Preprocessing')}
          
          {/* Upload Area */}
          <div className={`rounded-2xl shadow-lg border p-8 mb-8 backdrop-blur-sm transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${
              isDark 
                ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
            }`}>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Upload Pension Data</h3>
              <p className={`mb-6 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Drag and drop your CSV, Excel, or JSON files here</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Browse Files
              </button>
              <p className={`text-sm mt-3 transition-colors duration-300 ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>Supported formats: CSV, XLSX, JSON (Max 50MB)</p>
            </div>
          </div>

          {/* Data Processing Status */}
          <div className={`rounded-2xl shadow-lg border p-6 mb-8 backdrop-blur-sm transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Processing Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Data Validation</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>Complete</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Data Cleaning</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>In Progress</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Feature Engineering</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                    isDark ? 'bg-gray-600' : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className={`rounded-2xl shadow-lg border p-6 backdrop-blur-sm transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Data Preview</h3>
            <div className={`rounded-lg border transition-all duration-300 ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <table className="w-full">
                <thead className={`transition-colors duration-300 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>Member ID</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>Age</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>Annual Income</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>Contribution</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${
                  isDark ? 'divide-gray-600' : 'divide-gray-200'
                }`}>
                  {[
                    ['M001', '28', '$52,000', '$416'],
                    ['M002', '34', '$65,000', '$520'],
                    ['M003', '42', '$85,000', '$680'],
                    ['M004', '29', '$55,000', '$440']
                  ].map((row, index) => (
                    <tr key={index}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={`px-4 py-3 text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-900'
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                ),
                status: 'active'
              },
              {
                title: 'Risk Assessment',
                description: 'Identify potential risks in pension portfolios',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                ),
                status: 'coming-soon'
              },
              {
                title: 'Optimization Engine',
                description: 'Suggest optimal contribution strategies',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                ),
                status: 'beta'
              }
            ].map((feature, index) => (
              <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.status === 'active' ? 'bg-green-100 text-green-600' :
                  feature.status === 'beta' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{feature.title}</h3>
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    feature.status === 'active' ? 'bg-green-100 text-green-800' :
                    feature.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feature.status === 'active' ? 'Active' :
                     feature.status === 'beta' ? 'Beta' : 'Coming Soon'}
                  </span>
                  <button className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                    feature.status === 'active' 
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
          <div className={`rounded-2xl shadow-lg border p-6 backdrop-blur-sm transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-6 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Latest AI Insights</h3>
            <div className="space-y-4">
              {getAIInsights().map((insight, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                      isDark ? 'bg-gray-600' : 'bg-white shadow-sm'
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{insight.title}</h4>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
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
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                )
              },
              {
                title: 'Excel Export',
                description: 'Export data and charts to Excel format',
                format: 'XLSX',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                )
              },
              {
                title: 'PowerPoint',
                description: 'Create presentation-ready slides with charts',
                format: 'PPTX',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                  </svg>
                )
              }
            ].map((exportOption, index) => (
              <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 text-white">
                  {exportOption.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{exportOption.title}</h3>
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{exportOption.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>{exportOption.format}</span>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-sm">
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Export History */}
          <div className={`rounded-2xl shadow-lg border p-6 backdrop-blur-sm transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Export History</h3>
            <div className="space-y-3">
              {[
                { name: 'Q4_2024_Pension_Report.pdf', date: '2024-12-15', size: '2.4 MB', status: 'completed' },
                { name: 'Member_Analysis_Charts.xlsx', date: '2024-12-10', size: '1.8 MB', status: 'completed' },
                { name: 'Board_Presentation.pptx', date: '2024-12-08', size: '5.2 MB', status: 'completed' }
              ].map((file, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                  isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
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
                  <button className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                    isDark 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}>
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