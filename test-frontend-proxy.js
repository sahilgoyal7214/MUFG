/**
 * Simple frontend proxy test script
 * Test if the updated proxy route is working correctly
 */

const FRONTEND_URL = 'http://localhost:3001';

console.log('🧪 Testing Frontend Proxy with Real Session');
console.log('===========================================');

/**
 * Test 1: Check proxy without authentication (should fail)
 */
async function testProxyWithoutAuth() {
  console.log('\n🔒 Test 1: Testing proxy without authentication...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/proxy/pension-data`);
    console.log('🔹 Status:', response.status);
    
    const data = await response.text();
    console.log('🔹 Response:', data.substring(0, 200) + '...');
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected unauthenticated request');
    } else {
      console.log('⚠️ Unexpected response for unauthenticated request');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Test 2: Check if proxy endpoint exists
 */
async function testProxyEndpoint() {
  console.log('\n🔍 Test 2: Testing proxy endpoint availability...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/proxy/pension-data`);
    console.log('🔹 Status:', response.status);
    console.log('🔹 Status Text:', response.statusText);
    
    if (response.status !== 404) {
      console.log('✅ Proxy endpoint exists');
    } else {
      console.log('❌ Proxy endpoint not found');
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Starting frontend proxy tests...\n');
  
  await testProxyEndpoint();
  await testProxyWithoutAuth();
  
  console.log('\n📝 Note: To test with authentication, you need to:');
  console.log('1. Open http://localhost:3001 in your browser');
  console.log('2. Log in as an advisor');
  console.log('3. Check the browser network tab for /api/proxy/pension-data requests');
  
  console.log('\n✨ Frontend proxy tests completed!');
}

// Run the tests
runTests().catch(console.error);
