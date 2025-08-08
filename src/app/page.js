'use client';

import { useState } from 'react';
import RoleSelection from '@/components/RoleSelection';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = (role, user) => {
    setCurrentUser(role);
    setUsername(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    setUsername('');
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
  };

  return (
    <main>
      {!selectedRole ? (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      ) : !currentUser ? (
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
        />
      )}
    </main>
  );
}
