'use client';

import { useState } from 'react';

export default function RoleSelection({ onRoleSelect }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'member',
      title: 'Member Portal',
      description: 'Access your pension data and insights',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
      color: 'blue',
      bgColor: 'bg-blue-600',
      bgColorLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      bgColorHover: 'bg-blue-50'
    },
    {
      id: 'advisor',
      title: 'Advisor Portal',
      description: 'Manage client portfolios and analytics',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      ),
      color: 'green',
      bgColor: 'bg-green-600',
      bgColorLight: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      bgColorHover: 'bg-green-50'
    },
    {
      id: 'regulator',
      title: 'Regulator Portal',
      description: 'Oversight and compliance monitoring',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
      color: 'red',
      bgColor: 'bg-red-600',
      bgColorLight: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
      bgColorHover: 'bg-red-50'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    onRoleSelect(role.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to MUFG Pension Insights
          </h1>
          <p className="text-gray-600">
            Select your role to access the appropriate dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                selectedRole === role.id
                  ? `${role.borderColor} ${role.bgColorLight}`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                selectedRole === role.id
                  ? `${role.bgColor} text-white`
                  : `${role.bgColorLight} ${role.textColor}`
              }`}>
                {role.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-gray-600">
                {role.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@mufg.com" className="text-blue-600 hover:underline">
              support@mufg.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
