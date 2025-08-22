#!/usr/bin/env node

// Quick debug test to check the token endpoint directly
import fetch from 'node-fetch';

console.log('🔍 Quick Token Endpoint Test');
console.log('=' .repeat(30));

async function quickTest() {
    try {
        console.log('🚀 Testing GET request to /api/auth/token...');
        
        // Test GET request
        const getResponse = await fetch('http://localhost:3000/api/auth/token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('GET Response Status:', getResponse.status);
        const getResult = await getResponse.text();
        console.log('GET Response:', getResult);
        
        console.log('\n🚀 Testing POST request to /api/auth/token...');
        
        // Test POST request
        const postResponse = await fetch('http://localhost:3000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('POST Response Status:', postResponse.status);
        const postResult = await postResponse.text();
        console.log('POST Response:', postResult);
        
        // Check if server is on different port
        console.log('\n🚀 Testing port 3001...');
        const port3001Response = await fetch('http://localhost:3001/api/auth/token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Port 3001 Response Status:', port3001Response.status);
        const port3001Result = await port3001Response.text();
        console.log('Port 3001 Response:', port3001Result);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

quickTest();
