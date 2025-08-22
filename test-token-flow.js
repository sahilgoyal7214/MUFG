#!/usr/bin/env node

// Test Token Flow - Demonstrates the correct way to use tokens
const fetch = require('node-fetch');

console.log('🔍 Testing Token Flow Between Frontend and Backend');
console.log('=' .repeat(50));

async function testTokenFlow() {
    try {
        // Step 1: Login to NextAuth (simulate frontend login)
        console.log('\n1️⃣  Simulating Frontend Login...');
        
        // Step 2: Get JWT token from frontend API
        console.log('\n2️⃣  Getting JWT token from /api/auth/token...');
        const tokenResponse = await fetch('http://localhost:3000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // This would normally include the NextAuth session cookie
            // For testing, we'll simulate a logged-in user
        });
        
        if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            console.log('✅ JWT Token received:', tokenData.token?.substring(0, 50) + '...');
            
            // Step 3: Use JWT token to call backend API
            console.log('\n3️⃣  Testing JWT token with backend API...');
            const backendResponse = await fetch('http://localhost:4000/api/dashboard/data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenData.token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (backendResponse.ok) {
                console.log('✅ Backend API call successful!');
                const data = await backendResponse.json();
                console.log('📊 Response:', data);
            } else {
                console.log('❌ Backend API call failed');
                console.log('Status:', backendResponse.status);
                const error = await backendResponse.text();
                console.log('Error:', error);
            }
            
        } else {
            console.log('❌ Failed to get JWT token');
            console.log('Status:', tokenResponse.status);
            const error = await tokenResponse.text();
            console.log('Error:', error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

console.log('\n💡 KEY POINTS:');
console.log('1. NextAuth session cookie ≠ JWT token');
console.log('2. Use /api/auth/token to get JWT for backend');
console.log('3. Send JWT as Authorization: Bearer <token>');
console.log('4. Backend validates JWT with NEXTAUTH_SECRET');

console.log('\n🚀 Starting test...');
testTokenFlow();
