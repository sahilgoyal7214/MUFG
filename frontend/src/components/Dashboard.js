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
  { id: 'advisorTools', label: 'Planning Tools', icon: 'tools' },
  { id: 'advisorExploreCharts', label: 'Explore Charts', icon: 'chart' }
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

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const renderContent = () => {
    switch (currentUser) {
      case 'member':
        return <MemberContent activeTab={activeTab} isDark={isDark} />;
      case 'advisor':
        return <AdvisorContent activeTab={activeTab} isDark={isDark} />;
      case 'regulator':
        return <RegulatorContent activeTab={activeTab} isDark={isDark} />;
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
    {/* Dark Mode Toggle */}
   <button
  onClick={toggleTheme}
  className={`p-3 rounded-xl transition-all duration-300 ${
    isDark 
      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-lg'
  }`}
>
  {isDark ? (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ) : (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )}
</button>


        {/* Logout Button - dark mode compatible */}
        <button onClick={onLogout} className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-100'} group`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : `bg-${config.color}-100`}`}>
            <span className={`font-medium text-sm ${isDark ? 'text-white' : `text-${config.color}-600`}`}>{config.initials}</span>
          </div>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>{username}</span>
          <svg className={`w-4 h-4 ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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