#!/usr/bin/env node

// Test getting proper JWT token from frontend API
import fetch from 'node-fetch';

console.log('🔧 Testing JWT Token Generation from Frontend');
console.log('=' .repeat(50));

async function testJWTGeneration() {
    try {
        console.log('🚀 Calling /api/auth/token endpoint...');
        
        const response = await fetch('http://localhost:3000/api/auth/token', {
            method: 'GET',
            credentials: 'include', // Include session cookies
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Got JWT token from frontend');
            console.log('🎫 Token preview:', data.token?.substring(0, 50) + '...');
            
            // Test this token with backend
            console.log('\n🧪 Testing JWT token with backend API...');
            const backendResponse = await fetch('http://localhost:4000/api/dashboard/data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (backendResponse.ok) {
                console.log('✅ Backend API call successful with JWT token!');
                const result = await backendResponse.json();
                console.log('📊 Response:', result.message || result);
            } else {
                console.log('❌ Backend API call failed');
                console.log('Status:', backendResponse.status);
                const error = await backendResponse.text();
                console.log('Error:', error);
            }
            
        } else {
            console.log('❌ Failed to get JWT token from frontend');
            console.log('Status:', response.status);
            const error = await response.text();
            console.log('Error:', error);
            
            if (response.status === 401) {
                console.log('\n💡 You need to be logged in first!');
                console.log('1. Go to http://localhost:3000/test-login');
                console.log('2. Login with username/password');
                console.log('3. Then call /api/auth/token');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

console.log('🎯 This test will show you how to get the CORRECT token');
console.log('📍 Make sure you are logged in at localhost:3001/test-login first\n');

testJWTGeneration();
