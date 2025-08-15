'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import MemberContent from './roles/MemberContent';
import AdvisorContent from './roles/AdvisorContent';
import RegulatorContent from './roles/RegulatorContent';

const userConfigs = {
  member: {
    name: 'Pension Data Insights',
    initials: 'MB',
    color: 'blue',
    navigation: [
      { id: 'memberCharts', label: 'Explore Charts', icon: 'chart' },
      { id: 'memberAI', label: 'AI Assistant', icon: 'ai' },
      { id: 'memberExport', label: 'Export Report', icon: 'export' }
    ]
  },
  advisor: {
    name: 'Advisor Dashboard',
    initials: 'AD',
    color: 'green',
    navigation: [
      { id: 'advisorPortfolio', label: 'Client Portfolio', icon: 'users' },
      { id: 'advisorAnalytics', label: 'Analytics', icon: 'chart' },
      { id: 'advisorReports', label: 'Reports', icon: 'document' },
      { id: 'advisorTools', label: 'Planning Tools', icon: 'tools' }
    ]
  },
  regulator: {
    name: 'Regulatory Oversight',
    initials: 'RG',
    color: 'red',
    navigation: [
      { id: 'regulatorCompliance', label: 'Compliance Overview', icon: 'shield' },
      { id: 'regulatorReports', label: 'Regulatory Reports', icon: 'document' },
      { id: 'regulatorAudits', label: 'Audits & Reviews', icon: 'search' },
      { id: 'regulatorAlerts', label: 'Risk Alerts', icon: 'warning' }
    ]
  }
};

export default function Dashboard({ currentUser, username, onLogout }) {
  const [activeTab, setActiveTab] = useState('');
  const [isDark, setIsDark] = useState(false);

  const config = userConfigs[currentUser];

  useEffect(() => {
    if (config && config.navigation.length > 0) {
      setActiveTab(config.navigation[0].id);
    }
  }, [config]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark', !isDark);
  };

  const renderContent = () => {
    switch (currentUser) {
      case 'member':
        return <MemberContent activeTab={activeTab} />;
      case 'advisor':
        return <AdvisorContent activeTab={activeTab} />;
      case 'regulator':
        return <RegulatorContent activeTab={activeTab} />;
      default:
        return null;
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-${config.color}-600 rounded-lg flex items-center justify-center`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Pension Insights</h1>
            <p className="text-sm text-gray-500">{config.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2zM4 7h12V5H4v2z"/>
            </svg>
          </button>
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>
          <button onClick={onLogout} className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <div className={`w-8 h-8 bg-${config.color}-100 rounded-full flex items-center justify-center`}>
              <span className={`text-${config.color}-600 font-medium text-sm`}>{config.initials}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{username}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className="flex h-screen">
        {/* Left Sidebar */}
        <Navigation 
          config={config} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}