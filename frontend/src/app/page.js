'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import RoleSelection from '../components/RoleSelection';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');

  // Handle session changes - when user logs in via NextAuth
  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user.role);
      setUsername(session.user.username);
      setSelectedRole(null); // Clear role selection when logged in
    } else if (status === 'unauthenticated') {
      // Reset state when session ends
      setCurrentUser(null);
      setUsername('');
      setSelectedRole(null);
    }
  }, [session, status]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogout = async () => {
    if (session) {
      // If using NextAuth session, sign out properly
      await signOut({ redirect: false });
    }
    // Reset state after logout
    setCurrentUser(null);
    setUsername('');
    setSelectedRole(null);
  };

  const handleRoleSwitch = (newRole) => {
    // Only allow role switching if user is authenticated
    if (session?.user) {
      setCurrentUser(newRole);
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
      {!selectedRole && !session?.user ? (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      ) : selectedRole && !session?.user ? (
        <LoginForm 
          selectedRole={selectedRole} 
          onLogin={() => {}} // NextAuth handles login
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
