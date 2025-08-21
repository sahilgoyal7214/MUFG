'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import MemberContent from './roles/MemberContent';
import AdvisorContent from './roles/AdvisorContent';
import RegulatorContent from './roles/RegulatorContent';

// Map Tailwind-safe colors
const colorMap = {
  blue: {
    bg600: 'bg-blue-600',
    bg100: 'bg-blue-100',
    text600: 'text-blue-600',
  },
  green: {
    bg600: 'bg-green-600',
    bg100: 'bg-green-100',
    text600: 'text-green-600',
  },
  red: {
    bg600: 'bg-red-600',
    bg100: 'bg-red-100',
    text600: 'text-red-600',
  },
};

const userConfigs = {
  member: {
    name: 'Pension Data Insights',
    initials: 'MB',
    color: 'blue',
    navigation: [
      { id: 'memberCharts', label: 'Explore Charts', icon: 'chart' },
      { id: 'memberAI', label: 'AI Assistant', icon: 'ai' },
      { id: 'memberExport', label: 'Export Report', icon: 'export' },
    ],
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
      { id: 'advisorExploreCharts', label: 'Explore Charts', icon: 'chart' },
    ],
  },
  regulator: {
    name: 'Regulatory Oversight',
    initials: 'RG',
    color: 'red',
    navigation: [
      { id: 'regulatorCompliance', label: 'Compliance Overview', icon: 'shield' },
      { id: 'regulatorReports', label: 'Regulatory Reports', icon: 'document' },
      { id: 'regulatorAudits', label: 'Audits & Reviews', icon: 'search' },
      { id: 'regulatorAlerts', label: 'Risk Alerts', icon: 'warning' },
    ],
  },
};

// Mock Navigation Component


// Mock Content Components
export default function Dashboard({ currentUser = 'member', username = 'Demo User', onLogout = () => { } }) {
  const [activeTab, setActiveTab] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [userToggled, setUserToggled] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const config = userConfigs[currentUser];
  const themeColors = colorMap[config.color];

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme-preference');
    const storedUserToggled = localStorage.getItem('user-toggled-theme');
    
    if (storedTheme) {
      // User has a saved preference
      setIsDark(storedTheme === 'dark');
      setUserToggled(storedUserToggled === 'true');
    } else {
      // No saved preference, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
    setIsThemeLoaded(true);
  }, []);

  // Apply dark class to document
  useEffect(() => {
    if (isThemeLoaded) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [isDark, isThemeLoaded]);

  // Watch for system theme changes (only if user hasn't manually toggled)
  useEffect(() => {
    if (!isThemeLoaded) return;
    
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!userToggled) {
        setIsDark(e.matches);
      }
    };
    darkModeMedia.addEventListener('change', handleChange);
    return () => darkModeMedia.removeEventListener('change', handleChange);
  }, [userToggled, isThemeLoaded]);

  // Set default tab and load from localStorage
  useEffect(() => {
    if (config && config.navigation.length > 0) {
      // Try to load saved tab for this user role
      const savedTab = localStorage.getItem(`active-tab-${currentUser}`);
      if (savedTab && config.navigation.some(nav => nav.id === savedTab)) {
        setActiveTab(savedTab);
      } else {
        setActiveTab(config.navigation[0].id);
      }
    }
  }, [config, currentUser]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setUserToggled(true);
    setIsDark(newTheme);
    
    // Save preferences to localStorage
    localStorage.setItem('theme-preference', newTheme ? 'dark' : 'light');
    localStorage.setItem('user-toggled-theme', 'true');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Save active tab for this user role
    localStorage.setItem(`active-tab-${currentUser}`, tabId);
  };

  const renderContent = () => {
    switch (currentUser) {
      case 'member':
        return <MemberContent activeTab={activeTab} isDark={isDark} currentUserId={"U1086"} />;
      case 'advisor':
        return <AdvisorContent activeTab={activeTab} isDark={isDark} />;
      case 'regulator':
        return <RegulatorContent activeTab={activeTab} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${themeColors.bg600} rounded-lg flex items-center justify-center`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pension Insights</h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">{config.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 ${isDark
              ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-lg'
              }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 group
    ${isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-lg"
              }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${themeColors.bg100} dark:bg-gray-700`}
            >
              <span className={`font-medium text-sm ${themeColors.text600} dark:text-white`}>
                {config.initials}
              </span>
            </div>

            {/* Username */}
            <span
              className={`px-6 py-3 text-left text-xs uppercase transition-colors duration-200
      ${isDark
                  ? "font-bold text-gray-200 group-hover:text-yellow-400"
                  : "font-medium text-gray-500 group-hover:text-gray-700"
                }`}
            >
              {username}
            </span>

            {/* Logout Icon */}
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>


        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1">
        <Navigation config={config} activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900">{renderContent()}</main>
      </div>
    </div>
  );
}