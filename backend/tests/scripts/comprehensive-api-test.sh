#!/bin/bash

# Comprehensive API Testing Script for MUFG Pension Insights Backend
# Tests all endpoints with proper authentication and error handling

echo "🧪 MUFG Pension Insights Backend - Comprehensive API Testing"
echo "=============================================================="

# Configuration
BASE_URL="http://localhost:4000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJSRUcwMDEiLCJlbWFpbCI6InJlZ3VsYXRvckBtdWZnLmNvbSIsInJvbGUiOiJSRUdVTEFUT1IiLCJuYW1lIjoiSm9obiBSZWd1bGF0b3IiLCJwZXJtaXNzaW9ucyI6WyJVU0VSX1JFQURfQUxMIiwiQU5BTFlUSUNTX1JFQUQiLCJBTkFMWVRJQ1NfVklFV19BTEwiLCJBVURJVF9MT0dTIiwiTUVNQkVSX0RBVEFfUkVBRF9BTEwiLCJNRU1CRVJfREFUQV9DUkVBVEUiLCJNRU1CRVJfREFUQV9VUERBVEUiLCJNRU1CRVJfREFUQV9ERUxFVEUiXSwiaWF0IjoxNzU1NTA5MDUxLCJleHAiOjE3NTU1OTU0NTEsImlzcyI6Im11ZmctcGVuc2lvbi1pbnNpZ2h0cyIsImF1ZCI6Im11ZmctYXBpIn0.Mm24VX0ZVBW-fR4Lfo7xaY0M_ZBHCWyTuUeL0sDXGXM"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo ""
    echo "🔧 Test: $test_name"
    echo "   Method: $method"
    echo "   Endpoint: $endpoint"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "$BASE_URL$endpoint")
    fi
    
    # Extract HTTP status and response body
    status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed "s/HTTPSTATUS:[0-9]*//")
    
    echo "   Status: $status (expected: $expected_status)"
    
    # Check if test passed
    if [ "$status" = "$expected_status" ]; then
        echo "   ✅ PASSED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Pretty print JSON if possible
        if echo "$body" | python3 -m json.tool >/dev/null 2>&1; then
            echo "   Response:"
            echo "$body" | python3 -m json.tool | sed 's/^/      /'
        else
            echo "   Response: $body"
        fi
    else
        echo "   ❌ FAILED"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "   Response: $body"
    fi
}

# Start the server
echo "🚀 Starting backend server..."
cd /mnt/Project/Projects/mufg/backend
node app.js > test-server.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Test if server is running
if curl -s "$BASE_URL" >/dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server failed to start"
    cat test-server.log
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🔐 AUTHENTICATION TESTS"
echo "======================="

# Test 1: Health check (no auth required)
run_test "Health Check" "GET" "/" 200

# Test 2: API Documentation (no auth required)
run_test "API Documentation" "GET" "/api" 200

# Test 3: Auth verification
run_test "Token Verification" "GET" "/api/auth/me" 200

echo ""
echo "📊 PENSION DATA API TESTS"
echo "========================="

# Test 4: Get pension data statistics
run_test "Get Statistics" "GET" "/api/pension-data/stats/overview" 200

# Test 5: List pension data with pagination
run_test "List Pension Data" "GET" "/api/pension-data?limit=5" 200

# Test 6: Search pension data
run_test "Search by Country" "GET" "/api/pension-data?country=Japan&limit=3" 200

# Test 7: Create new pension data
TEST_DATA='{
  "user_id": "TEST_USER_001",
  "age": 35,
  "gender": "Male",
  "country": "Japan",
  "employment_status": "Employed",
  "annual_income": 75000,
  "current_savings": 150000,
  "risk_tolerance": "Moderate",
  "pension_type": "Defined Contribution"
}'

run_test "Create Pension Data" "POST" "/api/pension-data" "$TEST_DATA" 201

# Extract created ID for further testing
CREATED_ID=""
if [ $? -eq 0 ]; then
    CREATED_ID=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
    echo "   Created ID: $CREATED_ID"
fi

# Test 8: Get specific pension data (if ID was created)
if [ -n "$CREATED_ID" ]; then
    run_test "Get Specific Record" "GET" "/api/pension-data/$CREATED_ID" 200
    
    # Test 9: Update pension data
    UPDATE_DATA='{
      "annual_income": 80000,
      "current_savings": 160000,
      "risk_tolerance": "Aggressive"
    }'
    
    run_test "Update Pension Data" "PUT" "/api/pension-data/$CREATED_ID" "$UPDATE_DATA" 200
    
    # Test 10: Delete pension data
    run_test "Delete Pension Data" "DELETE" "/api/pension-data/$CREATED_ID" 200
fi

echo ""
echo "👥 MEMBER DATA API TESTS"
echo "========================"

# Test 11: Get member data (using test member ID)
run_test "Get Member Data" "GET" "/api/members/M001" "" "200|404"

echo ""
echo "🤖 CHATBOT API TESTS"
echo "===================="

# Test 12: Chatbot interaction
CHAT_DATA='{
  "message": "What is my current pension balance?",
  "userId": "TEST_USER_001"
}'

run_test "Chatbot Interaction" "POST" "/api/chatbot/interact" "$CHAT_DATA" 200

echo ""
echo "📈 ANALYTICS API TESTS"
echo "======================"

# Test 13: KPI calculations
run_test "Get KPIs" "GET" "/api/kpi/calculate" 200

# Test 14: Analytics data
run_test "Get Analytics" "GET" "/api/analytics/overview" 200

echo ""
echo "👤 USER MANAGEMENT TESTS"
echo "========================"

# Test 15: List users
run_test "List Users" "GET" "/api/users" 200

echo ""
echo "📝 AUDIT LOGS TESTS"
echo "==================="

# Test 16: Get audit logs
run_test "Get Audit Logs" "GET" "/api/logs/audit" 200

echo ""
echo "🚫 ERROR HANDLING TESTS"
echo "======================="

# Test 17: Invalid endpoint
run_test "Invalid Endpoint" "GET" "/api/invalid-endpoint" 404

# Test 18: Unauthorized access (no token)
echo ""
echo "🔧 Test: Unauthorized Access"
echo "   Method: GET"
echo "   Endpoint: /api/pension-data"

TOTAL_TESTS=$((TOTAL_TESTS + 1))

unauth_response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/api/pension-data")
unauth_status=$(echo "$unauth_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)

echo "   Status: $unauth_status (expected: 401)"

if [ "$unauth_status" = "401" ]; then
    echo "   ✅ PASSED"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "   ❌ FAILED"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 19: Invalid JSON data
INVALID_JSON='{"invalid": json}'
run_test "Invalid JSON Data" "POST" "/api/pension-data" "$INVALID_JSON" 400

echo ""
echo "📊 SWAGGER DOCUMENTATION TESTS"
echo "=============================="

# Test 20: Swagger UI
run_test "Swagger UI" "GET" "/api-docs" 200

# Test 21: OpenAPI JSON
run_test "OpenAPI Specification" "GET" "/api-docs.json" 200

echo ""
echo "🧹 Cleanup"
echo "=========="

# Kill the server
echo "Stopping server (PID: $SERVER_PID)..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "📋 TEST SUMMARY"
echo "==============="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED! The API is working correctly."
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Check the output above for details."
    echo "Server logs:"
    cat test-server.log
    exit 1
fi
