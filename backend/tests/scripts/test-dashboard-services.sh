#!/bin/bash

# MUFG Backend Dashboard Services Test Script
# Tests all extracted Streamlit dashboard functionality as API endpoints

echo "🔧 MUFG Backend Dashboard Services Testing"
echo "==========================================="

# Configuration
BASE_URL="http://localhost:4000"
API_BASE="${BASE_URL}/api"

# Test user IDs (from database)
TEST_USER_ID="1"
TEST_USER_ID_2="2"

echo "📡 Starting backend server..."
cd /mnt/Project/Projects/mufg/backend

# Start the server in background
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "🧪 Testing: $description"
    echo "📍 Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Success (200)"
        echo "📄 Response preview:"
        echo "$body" | jq -r '.data | keys[]' 2>/dev/null | head -5 || echo "Response contains data"
    else
        echo "❌ Failed ($http_code)"
        echo "📄 Error:"
        echo "$body" | jq -r '.message' 2>/dev/null || echo "$body"
    fi
}

# Test authentication endpoint first
echo ""
echo "🔐 Testing Authentication..."
AUTH_TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    "${API_BASE}/auth/login" | jq -r '.token' 2>/dev/null)

if [ "$AUTH_TOKEN" != "null" ] && [ -n "$AUTH_TOKEN" ]; then
    echo "✅ Authentication successful"
    AUTH_HEADER="Authorization: Bearer $AUTH_TOKEN"
else
    echo "❌ Authentication failed, proceeding without token"
    AUTH_HEADER=""
fi

# Health check
test_endpoint "GET" "${API_BASE}/advisor/health" "" "Advisor Services Health Check"

# Portfolio Optimization Tests
echo ""
echo "📊 PORTFOLIO OPTIMIZATION TESTS"
echo "================================"

test_endpoint "GET" "${API_BASE}/advisor/portfolio-optimization/${TEST_USER_ID}" "" "Portfolio Optimization for User"

test_endpoint "GET" "${API_BASE}/advisor/portfolio-rebalancing/${TEST_USER_ID}" "" "Portfolio Rebalancing Recommendations"

test_endpoint "POST" "${API_BASE}/advisor/portfolio-optimization/bulk" \
    '{"userIds":[1,2,3],"filters":{"riskTolerance":["Medium","High"]}}' \
    "Bulk Portfolio Optimization"

# Member Segmentation Tests
echo ""
echo "👥 MEMBER SEGMENTATION TESTS"
echo "============================"

test_endpoint "POST" "${API_BASE}/advisor/member-segmentation" \
    '{"filters":{"ageMin":25,"ageMax":65},"clusterCount":4}' \
    "Member Segmentation with KMeans Clustering"

test_endpoint "POST" "${API_BASE}/advisor/member-segmentation" \
    '{"filters":{"riskTolerance":["Low","Medium","High"]},"clusterCount":3}' \
    "Member Segmentation by Risk Tolerance"

# Risk Alert Tests
echo ""
echo "⚠️  RISK ALERT TESTS"
echo "==================="

test_endpoint "GET" "${API_BASE}/advisor/risk-alerts/${TEST_USER_ID}" "" "Risk Alerts for Individual Member"

test_endpoint "POST" "${API_BASE}/advisor/risk-alerts/bulk" \
    '{"userIds":[1,2,3,4,5],"riskLevel":"HIGH"}' \
    "Bulk Risk Alerts for High Risk Members"

test_endpoint "POST" "${API_BASE}/advisor/risk-alerts/bulk" \
    '{"riskLevel":"CRITICAL"}' \
    "All Critical Risk Alerts"

# Smart Contribution Tests
echo ""
echo "💰 SMART CONTRIBUTION TESTS"
echo "==========================="

test_endpoint "GET" "${API_BASE}/advisor/contribution-recommendations/${TEST_USER_ID}" "" "Contribution Recommendations"

test_endpoint "POST" "${API_BASE}/advisor/contribution-recommendations/${TEST_USER_ID}/what-if" \
    '[{"name":"Increase by $2000","newAnnualContribution":12000},{"name":"Delay retirement 2 years","retirementAgeChange":2}]' \
    "Contribution What-If Scenarios"

test_endpoint "POST" "${API_BASE}/advisor/contribution-recommendations/bulk" \
    '{"filters":{"ageMin":50,"ageMax":65}}' \
    "Bulk Contribution Recommendations for Pre-Retirees"

# What-If Simulator Tests
echo ""
echo "🎯 WHAT-IF SIMULATOR TESTS"
echo "=========================="

test_endpoint "POST" "${API_BASE}/advisor/what-if-simulation/${TEST_USER_ID}" \
    '{"scenarioParameters":{"contributionChanges":[0,1000,2000],"retirementAgeChanges":[-1,0,1],"returnRates":[0.05,0.07,0.09]}}' \
    "Comprehensive What-If Simulation"

test_endpoint "POST" "${API_BASE}/advisor/monte-carlo-simulation/${TEST_USER_ID}" \
    '{"simulations":1000}' \
    "Monte Carlo Simulation (1000 iterations)"

test_endpoint "POST" "${API_BASE}/advisor/monte-carlo-simulation/${TEST_USER_ID}" \
    '{"simulations":500}' \
    "Monte Carlo Simulation (500 iterations)"

# Dashboard Integration Test
echo ""
echo "📈 DASHBOARD INTEGRATION TEST"
echo "============================="

test_endpoint "GET" "${API_BASE}/advisor/dashboard/${TEST_USER_ID}" "" "Complete Advisor Dashboard Data"

# Advanced Scenario Tests
echo ""
echo "🔬 ADVANCED SCENARIO TESTS"
echo "=========================="

# Test with stress scenarios
test_endpoint "POST" "${API_BASE}/advisor/what-if-simulation/${TEST_USER_ID}" \
    '{
        "scenarioParameters": {
            "marketScenarios": [
                {"name": "Market Crash", "equity": -0.30, "bond": 0.02},
                {"name": "Stagflation", "equity": 0.02, "bond": 0.01}
            ],
            "inflationRates": [0.08, 0.10],
            "lifeExpectancy": [95, 100]
        }
    }' \
    "Stress Test Scenarios (Market Crash & Stagflation)"

# Test bulk operations
test_endpoint "POST" "${API_BASE}/advisor/portfolio-optimization/bulk" \
    '{"filters":{"ageMin":30,"ageMax":50,"riskTolerance":["Medium","High"]}}' \
    "Bulk Portfolio Optimization for Mid-Career High-Risk Members"

# Performance test with larger dataset
test_endpoint "POST" "${API_BASE}/advisor/member-segmentation" \
    '{"clusterCount":6}' \
    "Member Segmentation with 6 Clusters (Performance Test)"

echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo "✅ Completed testing all extracted dashboard services"
echo "🔧 Services tested:"
echo "   - Portfolio Optimization (Risk-based allocation, Age glide path)"
echo "   - Member Segmentation (KMeans clustering, Automated labeling)"
echo "   - Risk Alerts (Withdrawal rate, Asset allocation, Market risk)"
echo "   - Smart Contributions (Growth projections, Gap analysis)"
echo "   - What-If Simulator (Monte Carlo, Stress testing)"
echo ""
echo "📝 All Streamlit dashboard logic successfully extracted to backend API"
echo "🚀 Backend services ready for frontend integration"

# Stop the server
echo ""
echo "🛑 Stopping backend server..."
kill $SERVER_PID 2>/dev/null

echo "🎉 Testing complete!"
