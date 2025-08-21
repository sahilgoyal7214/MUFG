import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:4000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJURVNUMDAxIiwiZW1haWwiOiJ0ZXN0QG11ZmcuY29tIiwicm9sZSI6InJlZ3VsYXRvciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJtZW1iZXJJZCI6IlRFU1QwMDEiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyOnJlYWQ6YWxsIiwiYW5hbHl0aWNzOnJlYWQiLCJhbmFseXRpY3M6dmlldzphbGwiLCJhbmFseXRpY3M6dmlldzpvd24iLCJhbmFseXRpY3M6dmlldzphc3NpZ25lZCIsImFuYWx5dGljczpleHBvcnQiLCJhdWRpdDpsb2dzIiwibWVtYmVyX2RhdGE6cmVhZDphbGwiLCJtZW1iZXJfZGF0YTpjcmVhdGUiLCJtZW1iZXJfZGF0YTp1cGRhdGUiLCJtZW1iZXJfZGF0YTpkZWxldGUiLCJjaGF0Ym90OmFjY2VzcyIsInJlZ3VsYXRvcnk6b3ZlcnNpZ2h0IiwiY29tcGxpYW5jZTptb25pdG9yaW5nIiwiY29tcGxpYW5jZTpyZXBvcnRzIl0sImlhdCI6MTc1NTUxMjUyMCwiZXhwIjoxNzg3MDQ4NTIwLCJpc3MiOiJtdWZnLXBlbnNpb24taW5zaWdodHMiLCJhdWQiOiJtdWZnLWFwaSJ9.b6WGVaUMETbPoaaDcFDEcCiwLWGcMGcsOO2OPbQHZD0';

const HEADERS = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

// Enhanced Test Results Tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper Functions
function logTest(testId, description, status, details = null, response = null) {
  const result = {
    testId,
    description,
    status,
    details,
    response: response ? {
      status: response.status,
      data: response.data,
      headers: response.headers
    } : null,
    timestamp: new Date().toISOString()
  };
  
  testResults.details.push(result);
  testResults.total++;
  
  if (status === 'PASSED') {
    testResults.passed++;
    console.log(`✅ ${testId} PASSED: ${description}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testId} FAILED: ${description}`);
    if (details) console.log(`   Details: ${details}`);
  }
}

async function runTest(testFunction, testId, description) {
  try {
    await testFunction();
    logTest(testId, description, 'PASSED');
  } catch (error) {
    logTest(testId, description, 'FAILED', error.message);
  }
}

// Enhanced Test Cases
async function testInvalidAuthentication() {
  const response = await axios.get(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });
  
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

async function testMissingAuthentication() {
  const response = await axios.get(`${BASE_URL}/api/auth/me`);
  
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

async function testPaginationEdgeCases() {
  // Test negative page numbers
  const response1 = await axios.get(`${BASE_URL}/api/pension-data?page=-1&limit=10`, { headers: HEADERS });
  if (response1.status !== 200) {
    throw new Error(`Page boundary test failed: ${response1.status}`);
  }
  
  // Test extremely large page numbers
  const response2 = await axios.get(`${BASE_URL}/api/pension-data?page=99999&limit=10`, { headers: HEADERS });
  if (response2.status !== 200) {
    throw new Error(`Large page test failed: ${response2.status}`);
  }
  
  // Test zero and negative limits
  const response3 = await axios.get(`${BASE_URL}/api/pension-data?page=1&limit=0`, { headers: HEADERS });
  if (response3.status !== 200) {
    throw new Error(`Zero limit test failed: ${response3.status}`);
  }
}

async function testInvalidDataCreation() {
  // Test creating pension data with invalid data types
  const invalidData = {
    user_id: null,
    age: "invalid_age",
    annual_income: "not_a_number",
    monthly_expenses: -1000
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/pension-data`, invalidData, { headers: HEADERS });
    if (response.status === 201) {
      throw new Error('Should have rejected invalid data but created successfully');
    }
  } catch (error) {
    if (error.response && [400, 422].includes(error.response.status)) {
      // Expected validation error
      return;
    }
    throw error;
  }
}

async function testNonExistentResourceAccess() {
  try {
    const response = await axios.get(`${BASE_URL}/api/pension-data/999999`, { headers: HEADERS });
    if (response.status !== 404) {
      throw new Error(`Expected 404 for non-existent resource, got ${response.status}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return; // Expected
    }
    throw error;
  }
}

async function testConcurrentDataModification() {
  // Create a record first
  const createData = {
    user_id: "CONCURRENT_TEST_001",
    age: 30,
    country: "US",
    current_savings: 25000,
    retirement_age_goal: 65,
    contribution_amount: 500,
    contribution_frequency: "Monthly",
    projected_pension_amount: 800000,
    pension_type: "Defined Contribution"
  };
  
  const createResponse = await axios.post(`${BASE_URL}/api/pension-data`, createData, { headers: HEADERS });
  const recordId = createResponse.data.data.id;
  
  // Try concurrent updates
  const update1 = axios.put(`${BASE_URL}/api/pension-data/${recordId}`, 
    { monthlyContribution: 600 }, { headers: HEADERS });
  const update2 = axios.put(`${BASE_URL}/api/pension-data/${recordId}`, 
    { monthlyContribution: 700 }, { headers: HEADERS });
  
  const [response1, response2] = await Promise.all([update1, update2]);
  
  if (response1.status !== 200 && response2.status !== 200) {
    throw new Error('Both concurrent updates failed');
  }
  
  // Clean up
  await axios.delete(`${BASE_URL}/api/pension-data/${recordId}`, { headers: HEADERS });
}

async function testLargeDataHandling() {
  // Test with very large string inputs
  const largeData = {
    user_id: "LARGE_DATA_TEST_001",
    age: 35,
    country: "US",
    financial_goals: "A".repeat(10000), // Very large string
    current_savings: 50000,
    retirement_age_goal: 65,
    contribution_amount: 1000,
    contribution_frequency: "Monthly",
    projected_pension_amount: 1200000,
    pension_type: "Defined Contribution"
  };
  
  const response = await axios.post(`${BASE_URL}/api/pension-data`, largeData, { headers: HEADERS });
  
  if (response.status === 201) {
    // Clean up if created
    await axios.delete(`${BASE_URL}/api/pension-data/${response.data.data.id}`, { headers: HEADERS });
  }
}

async function testChatbotEdgeCases() {
  // Test empty message
  try {
    await axios.post(`${BASE_URL}/api/chatbot/message`, { message: "" }, { headers: HEADERS });
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 for empty message, got ${error.response?.status}`);
    }
  }
  
  // Test extremely long message
  const longMessage = "What should I do? ".repeat(1000);
  const response = await axios.post(`${BASE_URL}/api/chatbot/message`, 
    { message: longMessage }, { headers: HEADERS });
  
  if (response.status !== 200) {
    throw new Error(`Long message test failed: ${response.status}`);
  }
}

async function testKPICalculationBoundaries() {
  // Test with boundary values
  const boundaryData = {
    currentAge: 18, // Minimum working age
    targetCorpus: 0, // Zero target
    annualInvestment: 0, // Zero investment
    annualReturn: 0 // Zero return
  };
  
  const response = await axios.post(`${BASE_URL}/api/kpi/retirement-age`, boundaryData, { headers: HEADERS });
  
  if (response.status !== 200) {
    throw new Error(`Boundary KPI test failed: ${response.status}`);
  }
  
  // Test with very large values
  const largeData = {
    currentAge: 25,
    targetCorpus: 999999999,
    annualInvestment: 999999,
    annualReturn: 0.99
  };
  
  const response2 = await axios.post(`${BASE_URL}/api/kpi/retirement-age`, largeData, { headers: HEADERS });
  
  if (response2.status !== 200) {
    throw new Error(`Large value KPI test failed: ${response2.status}`);
  }
}

async function testAnalyticsDashboardRolePermissions() {
  // Test analytics access with current token (regulator role)
  const response = await axios.get(`${BASE_URL}/api/analytics/dashboard`, { headers: HEADERS });
  
  if (response.status !== 200) {
    throw new Error(`Analytics access failed: ${response.status}`);
  }
  
  // Verify response structure
  if (!response.data.success || !response.data.data) {
    throw new Error('Analytics response structure invalid');
  }
}

async function testAuditLogFiltering() {
  // Test with various filter combinations
  const filters = [
    'type=AUTHENTICATION',
    'type=DATA_ACCESS',
    'startDate=2025-08-01',
    'endDate=2025-08-31',
    'page=1&limit=5'
  ];
  
  for (const filter of filters) {
    const response = await axios.get(`${BASE_URL}/api/logs?${filter}`, { headers: HEADERS });
    if (response.status !== 200) {
      throw new Error(`Audit log filter test failed for: ${filter}`);
    }
  }
}

// Main Test Runner
async function runEnhancedTests() {
  console.log('🔥 Starting Enhanced Comprehensive Backend API Testing');
  console.log('=====================================================');
  
  const tests = [
    { id: 'ETC001', desc: 'Invalid Authentication Token Handling', fn: testInvalidAuthentication },
    { id: 'ETC002', desc: 'Missing Authentication Header Handling', fn: testMissingAuthentication },
    { id: 'ETC003', desc: 'Pagination Edge Cases and Boundary Values', fn: testPaginationEdgeCases },
    { id: 'ETC004', desc: 'Invalid Data Type Validation', fn: testInvalidDataCreation },
    { id: 'ETC005', desc: 'Non-Existent Resource Access', fn: testNonExistentResourceAccess },
    { id: 'ETC006', desc: 'Concurrent Data Modification Handling', fn: testConcurrentDataModification },
    { id: 'ETC007', desc: 'Large Data Input Handling', fn: testLargeDataHandling },
    { id: 'ETC008', desc: 'Chatbot Edge Cases and Input Validation', fn: testChatbotEdgeCases },
    { id: 'ETC009', desc: 'KPI Calculation Boundary Values', fn: testKPICalculationBoundaries },
    { id: 'ETC010', desc: 'Analytics Dashboard Role-Based Access', fn: testAnalyticsDashboardRolePermissions },
    { id: 'ETC011', desc: 'Audit Log Advanced Filtering', fn: testAuditLogFiltering }
  ];
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.id}: ${test.desc}`);
    await runTest(test.fn, test.id, test.desc);
  }
  
  // Generate comprehensive report
  console.log('\n📊 Enhanced Test Summary');
  console.log('========================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Save detailed report
  const detailedReport = {
    testSuite: 'Enhanced Comprehensive Backend API Tests',
    executionTime: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + '%'
    },
    testDetails: testResults.details
  };
  
  const reportPath = join(__dirname, '../testsprite_tests/enhanced-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`\n📋 Enhanced detailed test report saved to: ${reportPath}`);
}

// Handle axios errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

// Run tests
runEnhancedTests().catch(console.error);
