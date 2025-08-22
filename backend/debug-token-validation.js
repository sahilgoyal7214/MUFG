#!/usr/bin/env node

/**
 * Debug Token Validation Issues
 * Tests token generation and validation step by step
 */

import jwt from 'jsonwebtoken';

const NEXTAUTH_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔍 Debugging Token Validation Issues');
console.log('=====================================');

// Test 1: Create a test token like frontend would
console.log('\n1️⃣  Creating test token (simulating frontend)...');

const frontendTokenPayload = {
  sub: 'M001',
  email: 'member1@mufg.com',
  name: 'John Member',
  username: 'member1',
  role: 'member',
  roleData: {
    memberId: 'M001',
    age: 34,
    salary: 65000
  },
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
};

const testToken = jwt.sign(frontendTokenPayload, NEXTAUTH_SECRET);
console.log('✅ Token created:', testToken.substring(0, 50) + '...');

// Test 2: Verify the token like backend would
console.log('\n2️⃣  Verifying token (simulating backend)...');

try {
  const decoded = jwt.verify(testToken, NEXTAUTH_SECRET);
  console.log('✅ Token verification successful!');
  console.log('   Decoded payload:', JSON.stringify(decoded, null, 2));
  
  // Test 3: Extract user info like backend middleware
  console.log('\n3️⃣  Extracting user info (simulating backend middleware)...');
  
  const userInfo = {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    username: decoded.username,
    role: decoded.role,
    roleData: decoded.roleData,
    memberId: decoded.memberId || decoded.sub,
    permissions: decoded.permissions || []
  };
  
  console.log('✅ User info extracted:', JSON.stringify(userInfo, null, 2));
  
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test 4: Test with NextAuth issuer
console.log('\n4️⃣  Creating token with NextAuth issuer...');

const nextAuthTokenPayload = {
  ...frontendTokenPayload,
  iss: 'nextauth' // Add NextAuth issuer
};

const nextAuthToken = jwt.sign(nextAuthTokenPayload, NEXTAUTH_SECRET);
console.log('✅ NextAuth token created:', nextAuthToken.substring(0, 50) + '...');

try {
  const decoded = jwt.verify(nextAuthToken, NEXTAUTH_SECRET);
  console.log('✅ NextAuth token verification successful!');
} catch (error) {
  console.log('❌ NextAuth token verification failed:', error.message);
}

// Test 5: Live backend test
console.log('\n5️⃣  Testing live backend endpoint...');

const testBackend = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/users', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Backend response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API success:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ Backend API error:', errorData);
    }
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
  }
};

// Import fetch for Node.js
if (typeof fetch === 'undefined') {
  console.log('⚠️  Fetch not available, skipping live backend test');
  console.log('   Run this from a browser console or with node-fetch');
} else {
  await testBackend();
}

console.log('\n📋 Debug Summary');
console.log('================');
console.log('- Token generation: Working');
console.log('- Token verification: Check above results');
console.log('- Backend integration: Check live test results');
console.log('\n💡 Next steps:');
console.log('1. Check if backend is using the same NEXTAUTH_SECRET');
console.log('2. Verify token format matches backend expectations');
console.log('3. Check backend auth middleware for any additional validation');
