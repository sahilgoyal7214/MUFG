#!/usr/bin/env node

// Test the exact API call that's failing
import fetch from 'node-fetch';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJhZHZpc29yMUBtdWZnLmNvbSIsIm5hbWUiOiJKYW5lIEFkdmlzb3IiLCJ1c2VybmFtZSI6ImFkdmlzb3IxIiwicm9sZSI6ImFkdmlzb3IiLCJyb2xlRGF0YSI6eyJ0b3RhbENsaWVudHMiOjI0NywiYXZnUGVyZm9ybWFuY2UiOjcuOCwiY2xpZW50c05lZWRpbmdSZXZpZXciOjE4LCJhc3NldHNVbmRlck1hbmFnZW1lbnQiOjQ1MjAwMDAwfSwiaWF0IjoxNzU1ODEyNzk4LCJleHAiOjE3NTU4OTkxOTh9.IvuQrmfBGv74M637YOE_msZ0UKq04x_QTVIlL9EGlsw";

console.log('🧪 Testing exact API call that fails');
console.log('=' .repeat(40));

async function testAPI() {
    try {
        console.log('🚀 Making API call to /api/users...');
        console.log('🎫 Token:', token.substring(0, 50) + '...');
        
        const response = await fetch('http://localhost:4000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API call successful!');
            console.log('📊 Data:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ API call failed');
            console.log('❌ Error:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testAPI();
