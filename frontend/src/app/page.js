'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import RoleSelection from '../components/RoleSelection';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState('member'); // Default to member
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('Demo User');

  // Handle session changes - when user logs in via NextAuth
  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user.role);
      setUsername(session.user.username);
      setSelectedRole(null); // Clear role selection when logged in
    } else if (status === 'unauthenticated') {
      // Reset state when session ends
      setCurrentUser('member'); // Keep default member instead of null
      setUsername('Demo User');
    }
  }, [session, status]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = (role, user) => {
    // This handles the legacy login flow
    setCurrentUser(role);
    setUsername(user);
  };

  const handleLogout = async () => {
    if (session) {
      // If using NextAuth session, sign out properly
      await signOut({ redirect: false });
    } else {
      // Handle legacy logout - show role selection again
      setCurrentUser(null);
      setSelectedRole(null);
      setUsername('Demo User');
    }
  };

  const handleRoleSwitch = (newRole) => {
    setCurrentUser(newRole);
    // Keep the same username unless logged in via session
    if (!session?.user) {
      setUsername('Demo User');
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
  };

  // Show loading only if NextAuth is still checking session
  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {!selectedRole && !currentUser ? (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      ) : selectedRole && !currentUser ? (
        <LoginForm 
          selectedRole={selectedRole} 
          onLogin={handleLogin}
          onBack={handleBackToRoleSelection}
        />
      ) : (
        <Dashboard 
          currentUser={currentUser} 
          username={username}
          onLogout={handleLogout}
          onRoleSwitch={handleRoleSwitch}
        />
      )}
    </main>
  );
}
