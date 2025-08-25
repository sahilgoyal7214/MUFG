/**
 * JWT Token Extraction and Testing Script
 * This script will help us debug the JWT token authentication flow
 */

import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment setup
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production';

console.log('🔍 JWT Token Extraction and Testing');
console.log('=====================================');
console.log('🔹 NEXTAUTH_SECRET (first 20 chars):', NEXTAUTH_SECRET?.substring(0, 20) + '...');

/**
 * Test 1: Create a mock JWT token like the frontend does
 */
function createMockJWTToken() {
  console.log('\n📝 Test 1: Creating mock JWT token...');
  
  // Mock advisor session data (similar to what NextAuth would provide)
  const mockToken = {
    sub: 'ADV001',
    email: 'advisor@test.com',
    name: 'Test Advisor',
    username: 'advisor1',
    role: 'advisor',
    roleData: {
      id: 'ADV001',
      type: 'advisor',
      permissions: ['MEMBER_DATA_READ_ASSIGNED']
    },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
  };

  console.log('🔹 Mock token payload:', JSON.stringify(mockToken, null, 2));

  const jwtToken = jwt.sign(mockToken, NEXTAUTH_SECRET);
  console.log('🔹 Generated JWT token (first 100 chars):', jwtToken.substring(0, 100) + '...');
  
  return jwtToken;
}

/**
 * Test 2: Verify the token can be decoded by backend
 */
function testTokenDecoding(token) {
  console.log('\n🔍 Test 2: Testing token decoding...');
  
  try {
    const decoded = jwt.verify(token, NEXTAUTH_SECRET);
    console.log('✅ Token decoded successfully:', JSON.stringify(decoded, null, 2));
    return decoded;
  } catch (error) {
    console.log('❌ Token decoding failed:', error.message);
    return null;
  }
}

/**
 * Test 3: Test backend authentication with the token
 */
async function testBackendAuth(token, testName = '') {
  console.log(`\n🌐 Test 3${testName}: Testing backend authentication...`);
  
  try {
    console.log('🔹 Making request to:', `${BACKEND_URL}/api/pension-data`);
    console.log('🔹 Token (first 100 chars):', token.substring(0, 100) + '...');
    
    const response = await fetch(`${BACKEND_URL}/api/pension-data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔹 Response status:', response.status);
    console.log('🔹 Response status text:', response.statusText);
    
    const data = await response.text();
    console.log('🔹 Response body:', data);

    if (response.ok) {
      console.log('✅ Backend authentication successful');
      try {
        const jsonData = JSON.parse(data);
        console.log('🔹 Parsed response (first 500 chars):', JSON.stringify(jsonData, null, 2).substring(0, 500) + '...');
      } catch (parseError) {
        console.log('⚠️ Response is not JSON:', data);
      }
    } else {
      console.log('❌ Backend authentication failed');
    }

    return response;
  } catch (error) {
    console.log('❌ Backend request failed:', error.message);
    return null;
  }
}

/**
 * Test 4: Test with enhanced token that includes permissions
 */
function createEnhancedJWTToken() {
  console.log('\n🔧 Test 4: Creating enhanced JWT token with permissions...');
  
  const enhancedToken = {
    sub: 'ADV001',
    email: 'advisor@test.com',
    name: 'Test Advisor',
    username: 'advisor1',
    role: 'advisor',
    roleData: {
      id: 'ADV001',
      type: 'advisor',
      permissions: ['member_data:read:assigned'] // Fixed format
    },
    // Add permissions directly to token with correct format
    permissions: ['member_data:read:assigned'], // Fixed format
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
  };

  console.log('🔹 Enhanced token payload:', JSON.stringify(enhancedToken, null, 2));

  const jwtToken = jwt.sign(enhancedToken, NEXTAUTH_SECRET);
  console.log('🔹 Generated enhanced JWT token (first 100 chars):', jwtToken.substring(0, 100) + '...');
  
  return jwtToken;
}

/**
 * Test 5: Test backend health endpoint first
 */
async function testBackendHealth() {
  console.log('\n🏥 Test 5: Testing backend health...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    console.log('🔹 Health status:', response.status);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Backend is healthy:', data);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check error:', error.message);
    return false;
  }
}

/**
 * Test 6: Test frontend proxy endpoint
 */
async function testFrontendProxy() {
  console.log('\n🌐 Test 6: Testing frontend proxy endpoint...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/proxy/pension-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('🔹 Frontend proxy status:', response.status);
    console.log('🔹 Frontend proxy status text:', response.statusText);
    
    const data = await response.text();
    console.log('🔹 Frontend proxy response body (first 500 chars):', data.substring(0, 500) + '...');

    if (response.ok) {
      console.log('✅ Frontend proxy working');
    } else {
      console.log('❌ Frontend proxy failed');
    }

    return response;
  } catch (error) {
    console.log('❌ Frontend proxy request failed:', error.message);
    return null;
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Starting JWT token tests...\n');

  // Test 0: Check backend health
  const backendHealthy = await testBackendHealth();
  if (!backendHealthy) {
    console.log('⚠️ Backend is not responding, some tests may fail');
  }

  // Test 1: Create and decode basic token
  const basicToken = createMockJWTToken();
  const decodedBasic = testTokenDecoding(basicToken);

  if (decodedBasic) {
    // Test 2: Test backend auth with basic token
    await testBackendAuth(basicToken, ' (Basic Token)');
  }

  // Test 3: Create and test enhanced token
  const enhancedToken = createEnhancedJWTToken();
  const decodedEnhanced = testTokenDecoding(enhancedToken);

  if (decodedEnhanced) {
    // Test 4: Test backend auth with enhanced token
    await testBackendAuth(enhancedToken, ' (Enhanced Token)');
  }

  // Test 5: Test frontend proxy (requires session)
  console.log('\n⚠️ Note: Frontend proxy test requires a logged-in session');
  console.log('To test the frontend proxy, log in to the app and make a request');

  console.log('\n✨ JWT token tests completed!');
}

// Run the tests
runTests().catch(console.error);
