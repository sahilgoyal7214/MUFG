'use client';

export default function RoleSelection({ onRoleSelect }) {
  const roles = [
    {
      id: 'member',
      title: 'Member',
      description: 'View your pension details',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      ),
      hoverColor: 'blue'
    },
    {
      id: 'advisor',
      title: 'Advisor',
      description: 'Manage client portfolios',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      ),
      hoverColor: 'green'
    },
    {
      id: 'regulator',
      title: 'Regulator',
      description: 'Oversight and compliance',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      ),
      hoverColor: 'red'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pension Insights</h1>
          <p className="text-gray-600 mt-2">Select your role to continue</p>
        </div>
        
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-${role.hoverColor}-300 hover:bg-${role.hoverColor}-50 transition-all group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${role.hoverColor}-100 rounded-lg flex items-center justify-center group-hover:bg-${role.hoverColor}-200`}>
                  <svg className={`w-5 h-5 text-${role.hoverColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {role.icon}
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}