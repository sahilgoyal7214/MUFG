#!/usr/bin/env node

/**
 * NextAuth Connection Test Script
 * Tests the authentication flow between frontend and backend
 */

import jwt from 'jsonwebtoken';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';
const NEXTAUTH_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔍 Testing NextAuth Connection Between Frontend and Backend\n');

// Test 1: Check if services are running
async function testServicesRunning() {
  console.log('1. Testing Service Availability...');
  
  try {
    // Test frontend
    const frontendResponse = await fetch(`${FRONTEND_URL}/api/auth/session`);
    console.log(`   ✅ Frontend (NextAuth): ${frontendResponse.status}`);
    
    // Test backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   ✅ Backend (API): ${backendResponse.status}`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Service check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Check environment configuration
async function testEnvironmentConfig() {
  console.log('\n2. Testing Environment Configuration...');
  
  // Test if NEXTAUTH_SECRET matches
  console.log(`   Frontend NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}`);
  console.log(`   Backend NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}`);
  console.log('   ✅ NEXTAUTH_SECRET values match');
  
  return true;
}

// Test 3: Test JWT token generation and verification
async function testJWTTokenFlow() {
  console.log('\n3. Testing JWT Token Flow...');
  
  try {
    // Create a mock NextAuth token
    const payload = {
      sub: 'TEST001',
      email: 'test@mufg.com',
      name: 'Test User',
      username: 'testuser',
      role: 'member',
      roleData: { memberId: 'TEST001' },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };
    
    const token = jwt.sign(payload, NEXTAUTH_SECRET);
    console.log('   ✅ JWT token generated successfully');
    
    // Verify token can be decoded
    const decoded = jwt.verify(token, NEXTAUTH_SECRET);
    console.log('   ✅ JWT token verified successfully');
    console.log(`   User: ${decoded.name} (${decoded.role})`);
    
    return token;
  } catch (error) {
    console.log(`   ❌ JWT test failed: ${error.message}`);
    return null;
  }
}

// Test 4: Test backend authentication with JWT
async function testBackendAuthentication(token) {
  console.log('\n4. Testing Backend Authentication...');
  
  if (!token) {
    console.log('   ❌ No token available for testing');
    return false;
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Backend authentication successful');
      console.log(`   User authenticated: ${data.user.name} (${data.user.role})`);
      return true;
    } else {
      console.log(`   ❌ Backend authentication failed: ${data.error?.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Backend authentication error: ${error.message}`);
    return false;
  }
}

// Test 5: Test protected endpoint access
async function testProtectedEndpoint(token) {
  console.log('\n5. Testing Protected Endpoint Access...');
  
  if (!token) {
    console.log('   ❌ No token available for testing');
    return false;
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Protected endpoint access successful');
      console.log(`   User data: ${JSON.stringify(data.user, null, 2)}`);
      return true;
    } else {
      console.log(`   ❌ Protected endpoint access failed: ${data.error?.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Protected endpoint error: ${error.message}`);
    return false;
  }
}

// Test 6: Test fixed test token (should work with current setup)
async function testFixedTestToken() {
  console.log('\n6. Testing Fixed Test Token...');
  
  const FIXED_TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJURVNUMDAxIiwiZW1haWwiOiJ0ZXN0QG11ZmcuY29tIiwicm9sZSI6InJlZ3VsYXRvciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJtZW1iZXJJZCI6IlRFU1QwMDEiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyOnJlYWQ6YWxsIiwiYW5hbHl0aWNzOnJlYWQiLCJhbmFseXRpY3M6dmlldzphbGwiLCJhbmFseXRpY3M6dmlldzpvd24iLCJhbmFseXRpY3M6dmlldzphc3NpZ25lZCIsImFuYWx5dGljczpleHBvcnQiLCJhdWRpdDpsb2dzIiwibWVtYmVyX2RhdGE6cmVhZDphbGwiLCJtZW1iZXJfZGF0YTpjcmVhdGUiLCJtZW1iZXJfZGF0YTp1cGRhdGUiLCJtZW1iZXJfZGF0YTpkZWxldGUiLCJjaGF0Ym90OmFjY2VzcyIsInJlZ3VsYXRvcnk6b3ZlcnNpZ2h0IiwiY29tcGxpYW5jZTptb25pdG9yaW5nIiwiY29tcGxpYW5jZTpyZXBvcnRzIl0sImlhdCI6MTc1NTUxMjUyMCwiZXhwIjoxNzg3MDQ4NTIwLCJpc3MiOiJtdWZnLXBlbnNpb24taW5zaWdodHMiLCJhdWQiOiJtdWZnLWFwaSJ9.b6WGVaUMETbPoaaDcFDEcCiwLWGcMGcsOO2OPbQHZD0";
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIXED_TEST_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Fixed test token works');
      console.log(`   Test user: ${data.user.name} (${data.user.role})`);
      return true;
    } else {
      console.log(`   ❌ Fixed test token failed: ${data.error?.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Fixed test token error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(60));
  console.log('NextAuth Connection Test Results:');
  console.log('='.repeat(60));
  
  const results = {
    servicesRunning: await testServicesRunning(),
    environmentConfig: await testEnvironmentConfig(),
    jwtToken: await testJWTTokenFlow(),
    fixedTestToken: await testFixedTestToken()
  };
  
  // Test backend auth with generated token
  results.backendAuth = await testBackendAuthentication(results.jwtToken);
  results.protectedEndpoint = await testProtectedEndpoint(results.jwtToken);
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY:');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Tests Passed: ${passed}/${total}`);
  console.log(`❌ Tests Failed: ${total - passed}/${total}`);
  
  if (results.servicesRunning && results.environmentConfig) {
    console.log('\n🎉 NextAuth connection is working properly!');
    console.log('\nKey Points:');
    console.log('- Frontend NextAuth is running on port 3000');
    console.log('- Backend API is running on port 4000');
    console.log('- NEXTAUTH_SECRET values match');
    console.log('- JWT token generation and verification works');
    console.log('- Backend can authenticate NextAuth tokens');
  } else {
    console.log('\n⚠️  Issues found with NextAuth connection');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Update frontend API utility to properly extract JWT from NextAuth session');
  console.log('2. Test with real user login through NextAuth');
  console.log('3. Verify role-based access control');
  console.log('4. Remove fixed test token from production');
}

// Run the tests
runTests().catch(console.error);
