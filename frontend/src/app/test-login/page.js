"use client";

/**
 * Simple NextAuth Login Test
 * Tests login functionality and token generation
 */

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestLoginPage() {
  const { data: session, status, update } = useSession();
  const [credentials, setCredentials] = useState({
    username: 'advisor1',
    password: 'password123',
    role: 'advisor'
  });
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testLogin = async () => {
    setTestResults([]);
    addTestResult('🧪 Starting login test...');

    try {
      // Test login
      addTestResult(`Attempting login as ${credentials.username}...`);
      
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false
      });
      
      console.log('🔍 SignIn result:', result);
      
      if (result?.ok && !result?.error) {
        addTestResult('✅ Login successful!');
        
        // Wait a moment for session to be established and force refresh
        addTestResult('⏳ Waiting for session to be established...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force session update
        await update();
        
        // Test token generation
        addTestResult('Getting JWT token for backend...');
        const tokenResponse = await fetch('/api/auth/token');        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          addTestResult(`✅ JWT Token generated: ${tokenData.token.substring(0, 50)}...`);
          
          // Test backend API call
          addTestResult('Testing backend API call...');
          const apiResponse = await fetch('http://localhost:4000/api/users', {
            headers: {
              'Authorization': `Bearer ${tokenData.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log('🔍 API Response:', apiData);
            
            // Handle different response formats
            let userCount = 'N/A';
            if (apiData.data?.length) {
              userCount = apiData.data.length;
            } else if (apiData.users?.length) {
              userCount = apiData.users.length;
            } else if (apiData.total !== undefined) {
              userCount = apiData.total;
            }
            
            addTestResult(`✅ Backend API accessible! Users: ${userCount}`);
            addTestResult(`✅ Response format: ${apiData.success ? 'Success' : 'Data received'}`);
            
            if (apiData.message) {
              addTestResult(`✅ Message: ${apiData.message}`);
            }
          } else {
            const errorText = await apiResponse.text();
            addTestResult(`❌ Backend API error: ${apiResponse.status}`, false);
            addTestResult(`❌ Error details: ${errorText}`, false);
            addTestResult(`❌ Full token: ${tokenData.token}`, false);
          }
        } else {
          const errorText = await tokenResponse.text();
          addTestResult(`❌ Failed to get JWT token: ${tokenResponse.status} - ${errorText}`, false);
        }
      } else {
        addTestResult(`❌ Login failed: ${result?.error || 'Unknown error'}`, false);
      }
    } catch (error) {
      addTestResult(`❌ Test error: ${error.message}`, false);
    }
  };

  const testLogout = async () => {
    addTestResult('🔓 Testing logout...');
    await signOut({ redirect: false });
    addTestResult('✅ Logout successful!');
  };

  const testTokenOnly = async () => {
    addTestResult('🎫 Testing JWT token generation only...');
    try {
      const tokenResponse = await fetch('/api/auth/token');
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        addTestResult(`✅ JWT Token generated: ${tokenData.token.substring(0, 50)}...`);
      } else {
        const errorText = await tokenResponse.text();
        addTestResult(`❌ Failed to get JWT token: ${tokenResponse.status} - ${errorText}`, false);
      }
    } catch (error) {
      addTestResult(`❌ Token test error: ${error.message}`, false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            NextAuth Integration Test
          </h1>

          {/* Session Status */}
          <div className="mb-6 p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Session Status</h2>
            {status === 'loading' && <p>Loading...</p>}
            {status === 'authenticated' && (
              <div className="text-green-600">
                <p>✅ Authenticated as: {session.user.name}</p>
                <p>Role: {session.user.role}</p>
                <p>Email: {session.user.email}</p>
              </div>
            )}
            {status === 'unauthenticated' && (
              <p className="text-red-600">❌ Not authenticated</p>
            )}
          </div>

          {/* Login Form */}
          <div className="mb-6 p-4 border rounded">
            <h2 className="text-lg font-semibold mb-4">Test Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={credentials.role}
                  onChange={(e) => setCredentials(prev => ({...prev, role: e.target.value}))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="advisor">Advisor</option>
                  <option value="member">Member</option>
                  <option value="regulator">Regulator</option>
                </select>
              </div>
            </div>

            {/* Quick Credential Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCredentials({username: 'advisor1', password: 'password123', role: 'advisor'})}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                Advisor
              </button>
              <button
                onClick={() => setCredentials({username: 'member1', password: 'password123', role: 'member'})}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
              >
                Member
              </button>
              <button
                onClick={() => setCredentials({username: 'regulator1', password: 'password123', role: 'regulator'})}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm"
              >
                Regulator
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={testLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Login & API Access
              </button>
              {session && (
                <>
                  <button
                    onClick={testTokenOnly}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Get JWT Token
                  </button>
                  <button
                    onClick={testLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Test Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet. Click "Test Login & API Access" to start.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className={`mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    <span className="text-gray-500 text-sm">[{result.timestamp}]</span> {result.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
