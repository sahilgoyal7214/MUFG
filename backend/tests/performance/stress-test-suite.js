import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:4000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJURVNUMDAxIiwiZW1haWwiOiJ0ZXN0QG11ZmcuY29tIiwicm9sZSI6InJlZ3VsYXRvciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJtZW1iZXJJZCI6IlRFU1QwMDEiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyOnJlYWQ6YWxsIiwiYW5hbHl0aWNzOnJlYWQiLCJhbmFseXRpY3M6dmlldzphbGwiLCJhbmFseXRpY3M6dmlldzpvd24iLCJhbmFseXRpY3M6dmlldzphc3NpZ25lZCIsImFuYWx5dGljczpleHBvcnQiLCJhdWRpdDpsb2dzIiwibWVtYmVyX2RhdGE6cmVhZDphbGwiLCJtZW1iZXJfZGF0YTpjcmVhdGUiLCJtZW1iZXJfZGF0YTp1cGRhdGUiLCJtZW1iZXJfZGF0YTpkZWxldGUiLCJjaGF0Ym90OmFjY2VzcyIsInJlZ3VsYXRvcnk6b3ZlcnNpZ2h0IiwiY29tcGxpYW5jZTptb25pdG9yaW5nIiwiY29tcGxpYW5jZTpyZXBvcnRzIl0sImlhdCI6MTc1NTUxMjUyMCwiZXhwIjoxNzg3MDQ4NTIwLCJpc3MiOiJtdWZnLXBlbnNpb24taW5zaWdodHMiLCJhdWQiOiJtdWZnLWFwaSJ9.b6WGVaUMETbPoaaDcFDEcCiwLWGcMGcsOO2OPbQHZD0';

const HEADERS = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

// Stress Test Metrics
let metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  responseTimes: [],
  errors: []
};

async function makeRequest(endpoint, method = 'GET', data = null) {
  const startTime = performance.now();
  
  try {
    let response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(`${BASE_URL}${endpoint}`, { headers: HEADERS });
        break;
      case 'POST':
        response = await axios.post(`${BASE_URL}${endpoint}`, data, { headers: HEADERS });
        break;
      case 'PUT':
        response = await axios.put(`${BASE_URL}${endpoint}`, data, { headers: HEADERS });
        break;
      case 'DELETE':
        response = await axios.delete(`${BASE_URL}${endpoint}`, { headers: HEADERS });
        break;
    }
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    metrics.totalRequests++;
    metrics.responseTimes.push(responseTime);
    
    if (response.status >= 200 && response.status < 300) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      metrics.errors.push({
        endpoint,
        method,
        status: response.status,
        error: response.statusText
      });
    }
    
    return { success: true, responseTime, status: response.status };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    metrics.totalRequests++;
    metrics.failedRequests++;
    metrics.responseTimes.push(responseTime);
    metrics.errors.push({
      endpoint,
      method,
      error: error.message,
      status: error.response?.status || 'Network Error'
    });
    
    return { success: false, responseTime, error: error.message };
  }
}

async function runLoadTest(endpoint, method, data, concurrency, duration) {
  console.log(`\n🔥 Load Testing: ${method} ${endpoint}`);
  console.log(`   Concurrency: ${concurrency}, Duration: ${duration}ms`);
  
  const startTime = Date.now();
  const promises = [];
  
  // Start concurrent requests
  for (let i = 0; i < concurrency; i++) {
    const promise = (async () => {
      while (Date.now() - startTime < duration) {
        await makeRequest(endpoint, method, data);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between requests
      }
    })();
    promises.push(promise);
  }
  
  await Promise.all(promises);
}

async function stressTestAuthentication() {
  console.log('\n🔐 Authentication Stress Test');
  await runLoadTest('/api/auth/me', 'GET', null, 5, 5000);
}

async function stressTestPensionDataRead() {
  console.log('\n📊 Pension Data Read Stress Test');
  await runLoadTest('/api/pension-data', 'GET', null, 10, 10000);
}

async function stressTestPensionDataCreate() {
  console.log('\n➕ Pension Data Creation Stress Test');
  const sampleData = {
    user_id: `STRESS_TEST_${Date.now()}`,
    age: 30,
    country: "US",
    current_savings: 50000,
    retirement_age_goal: 65,
    contribution_amount: 800,
    contribution_frequency: "Monthly",
    projected_pension_amount: 1000000,
    pension_type: "Defined Contribution"
  };
  await runLoadTest('/api/pension-data', 'POST', sampleData, 3, 5000);
}

async function stressTestChatbot() {
  console.log('\n🤖 Chatbot Stress Test');
  const messages = [
    { message: "What is my pension balance?" },
    { message: "How much should I contribute monthly?" },
    { message: "When can I retire?" },
    { message: "Tell me about investment options" },
    { message: "What are the risks?" }
  ];
  
  for (const msg of messages) {
    await runLoadTest('/api/chatbot/message', 'POST', msg, 3, 3000);
  }
}

async function stressTestKPICalculations() {
  console.log('\n📈 KPI Calculations Stress Test');
  const kpiData = {
    currentAge: 30,
    targetCorpus: 1000000,
    annualInvestment: 12000,
    annualReturn: 0.07
  };
  await runLoadTest('/api/kpi/retirement-age', 'POST', kpiData, 5, 5000);
}

async function stressTestAnalytics() {
  console.log('\n📊 Analytics Dashboard Stress Test');
  await runLoadTest('/api/analytics/dashboard', 'GET', null, 8, 8000);
}

function calculateMetrics() {
  if (metrics.responseTimes.length === 0) return;
  
  metrics.averageResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  
  const sortedTimes = metrics.responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  return {
    totalRequests: metrics.totalRequests,
    successRate: ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) + '%',
    averageResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms',
    p50ResponseTime: p50.toFixed(2) + 'ms',
    p95ResponseTime: p95.toFixed(2) + 'ms',
    p99ResponseTime: p99.toFixed(2) + 'ms',
    errorCount: metrics.failedRequests,
    errors: metrics.errors
  };
}

async function runStressTests() {
  console.log('🚀 Starting Comprehensive Stress Testing');
  console.log('==========================================');
  
  // Reset metrics
  metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    responseTimes: [],
    errors: []
  };
  
  try {
    await stressTestAuthentication();
    await stressTestPensionDataRead();
    await stressTestPensionDataCreate();
    await stressTestChatbot();
    await stressTestKPICalculations();
    await stressTestAnalytics();
  } catch (error) {
    console.error('❌ Stress test error:', error.message);
  }
  
  // Calculate and display results
  const results = calculateMetrics();
  
  console.log('\n📊 Stress Test Results');
  console.log('======================');
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Success Rate: ${results.successRate}`);
  console.log(`Average Response Time: ${results.averageResponseTime}`);
  console.log(`50th Percentile: ${results.p50ResponseTime}`);
  console.log(`95th Percentile: ${results.p95ResponseTime}`);
  console.log(`99th Percentile: ${results.p99ResponseTime}`);
  console.log(`Total Errors: ${results.errorCount}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Error Details:');
    results.errors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.endpoint} - ${error.error}`);
    });
  }
  
  // Performance Assessment
  const avgTime = parseFloat(results.averageResponseTime);
  const successRate = parseFloat(results.successRate);
  
  console.log('\n🎯 Performance Assessment:');
  if (avgTime < 100) {
    console.log('✅ Excellent response times (< 100ms)');
  } else if (avgTime < 500) {
    console.log('🟡 Good response times (< 500ms)');
  } else {
    console.log('🔴 Slow response times (> 500ms)');
  }
  
  if (successRate > 99) {
    console.log('✅ Excellent reliability (> 99% success rate)');
  } else if (successRate > 95) {
    console.log('🟡 Good reliability (> 95% success rate)');
  } else {
    console.log('🔴 Poor reliability (< 95% success rate)');
  }
  
  return results;
}

// Handle axios errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

// Run stress tests
runStressTests().then(results => {
  console.log('\n🏁 Stress testing completed!');
}).catch(console.error);
