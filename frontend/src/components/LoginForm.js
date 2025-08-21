'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import AuthService from '../lib/authService';

export default function LoginForm({ selectedRole, onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials for each role
  const demoCredentials = {
    member: { username: 'member1', password: 'password123' },
    advisor: { username: 'advisor1', password: 'password123' },
    regulator: { username: 'regulator1', password: 'password123' }
  };

  const roleConfig = {
    member: {
      title: 'Member Portal',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      ),
      color: 'blue'
    },
    advisor: {
      title: 'Advisor Portal',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      ),
      color: 'green'
    },
    regulator: {
      title: 'Regulator Portal',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      ),
      color: 'red'
    }
  };

  const config = roleConfig[selectedRole];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Try backend API login first
      const backendResponse = await AuthService.login(username, password, selectedRole);
      
      if (backendResponse.token) {
        // Backend login successful, now try NextAuth
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
          role: selectedRole,
        });

        if (result?.ok) {
          // Both backend and NextAuth successful
          console.log('Login successful with both backend and NextAuth');
        } else {
          // Backend worked but NextAuth failed - still proceed with backend auth
          console.log('Backend login successful, NextAuth failed - proceeding with backend auth');
          onLogin(selectedRole, username);
        }
      }
    } catch (backendError) {
      console.error('Backend login failed:', backendError);
      
      // Fallback to NextAuth only
      try {
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
          role: selectedRole,
        });

        if (result?.ok) {
          console.log('NextAuth login successful');
        } else if (result?.error) {
          // Both backend and NextAuth failed, try legacy validation
          const validCredentials = demoCredentials[selectedRole];
          
          if (username === validCredentials.username && password === validCredentials.password) {
            onLogin(selectedRole, username);
          } else {
            setError('Invalid username or password. Please try again.');
          }
        }
      } catch (nextAuthError) {
        // All methods failed, try legacy validation as final fallback
        const validCredentials = demoCredentials[selectedRole];
        
        if (username === validCredentials.username && password === validCredentials.password) {
          onLogin(selectedRole, username);
        } else {
          setError('Authentication failed. Please check your credentials and try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    const credentials = demoCredentials[selectedRole];
    setUsername(credentials.username);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-${config.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {config.icon}
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">{config.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-6.9-1.1C5.726 10.343 6.78 9 8 9"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.2-5.2"/>
                    </>
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-${config.color}-600 text-white py-3 rounded-lg hover:bg-${config.color}-700 focus:ring-4 focus:ring-${config.color}-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Username: {demoCredentials[selectedRole].username}</div>
            <div>Password: {demoCredentials[selectedRole].password}</div>
            <button
              onClick={fillDemoCredentials}
              className="mt-2 text-blue-600 hover:text-blue-700 text-xs underline"
            >
              Fill automatically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
