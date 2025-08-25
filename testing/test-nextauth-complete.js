#!/usr/bin/env node

/**
 * Complete NextAuth Login Flow Test
 * Tests the full authentication flow from frontend login to backend API access
 */

import fetch from 'node-fetch';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';

// Test credentials
const testCredentials = {
  advisor: {
    username: 'advisor1',
    password: 'password123',
    role: 'advisor'
  },
  member: {
    username: 'member1', 
    password: 'password123',
    role: 'member'
  },
  regulator: {
    username: 'regulator1',
    password: 'password123',
    role: 'regulator'
  }
};

/**
 * Test NextAuth Login Flow
 */
async function testNextAuthLogin(userType = 'advisor') {
  console.log(`🧪 Testing NextAuth Login Flow for ${userType.toUpperCase()}`);
  console.log('='.repeat(60));

  const credentials = testCredentials[userType];
  
  try {
    // Step 1: Test NextAuth signin endpoint
    console.log('\n1️⃣  Testing NextAuth signin...');
    
    const signinResponse = await fetch(`${FRONTEND_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        role: credentials.role,
        callbackUrl: `${FRONTEND_URL}/dashboard`
      })
    });

    console.log(`   Status: ${signinResponse.status} ${signinResponse.statusText}`);
    
    if (signinResponse.status !== 200) {
      const errorText = await signinResponse.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      return false;
    }

    // Step 2: Get session token
    console.log('\n2️⃣  Getting session token...');
    
    const sessionResponse = await fetch(`${FRONTEND_URL}/api/auth/session`, {
      headers: {
        'Cookie': signinResponse.headers.get('set-cookie') || ''
      }
    });

    console.log(`   Status: ${sessionResponse.status} ${sessionResponse.statusText}`);
    
    if (sessionResponse.status !== 200) {
      console.log('   No active session found');
      return false;
    }

    const sessionData = await sessionResponse.json();
    console.log(`   User: ${sessionData.user?.name} (${sessionData.user?.role})`);

    // Step 3: Get JWT token for backend
    console.log('\n3️⃣  Getting JWT token for backend...');
    
    const tokenResponse = await fetch(`${FRONTEND_URL}/api/auth/token`, {
      headers: {
        'Cookie': signinResponse.headers.get('set-cookie') || ''
      }
    });

    if (tokenResponse.status !== 200) {
      console.log(`   Token error: ${tokenResponse.status}`);
      return false;
    }

    const tokenData = await tokenResponse.json();
    const jwtToken = tokenData.token;
    console.log(`   JWT Token: ${jwtToken.substring(0, 50)}...`);

    // Step 4: Test backend endpoints with JWT
    console.log('\n4️⃣  Testing backend API access...');
    
    // Test basic user endpoint
    const userResponse = await fetch(`${BACKEND_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Users API: ${userResponse.status} ${userResponse.statusText}`);
    
    if (userResponse.status === 200) {
      const userData = await userResponse.json();
      console.log(`   Users found: ${userData.users?.length || 'N/A'}`);
    }

    // Test role-specific endpoints
    if (userType === 'advisor') {
      console.log('\n5️⃣  Testing advisor-specific endpoints...');
      
      const portfolioResponse = await fetch(`${BACKEND_URL}/api/advisor/portfolio-optimization/M001`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Portfolio API: ${portfolioResponse.status} ${portfolioResponse.statusText}`);
    }

    console.log('\n✅ NextAuth login flow test completed successfully!');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Test server connectivity
 */
async function testServerConnectivity() {
  console.log('🔍 Testing server connectivity...\n');
  
  try {
    // Test frontend
    const frontendResponse = await fetch(`${FRONTEND_URL}/api/auth/signin`);
    console.log(`Frontend (${FRONTEND_URL}): ${frontendResponse.status} ✅`);
    
    // Test backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/users`);
    console.log(`Backend (${BACKEND_URL}): ${backendResponse.status} ✅`);
    
    return true;
  } catch (error) {
    console.log(`❌ Server connectivity error: ${error.message}`);
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 MUFG NextAuth Integration Test Suite');
  console.log('='=repeat(60));
  
  // Test server connectivity
  const serversReady = await testServerConnectivity();
  if (!serversReady) {
    console.log('\n❌ Servers not ready. Please ensure both frontend and backend are running.');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  
  // Test login flows for different user types
  await testNextAuthLogin('advisor');
  
  console.log('\n' + '='.repeat(60));
  await testNextAuthLogin('member');
  
  console.log('\n' + '='.repeat(60));
  await testNextAuthLogin('regulator');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testNextAuthLogin, testServerConnectivity };
