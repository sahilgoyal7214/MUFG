#!/bin/bash

# Test script for PensionData model and API endpoints using JWT token

echo "🧪 Testing PensionData Model and API Endpoints"
echo "================================================"

# JWT Token for testing (regulator role)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJSRUcwMDEiLCJlbWFpbCI6InJlZ3VsYXRvckBtdWZnLmNvbSIsInJvbGUiOiJSRUdVTEFUT1IiLCJuYW1lIjoiSm9obiBSZWd1bGF0b3IiLCJwZXJtaXNzaW9ucyI6WyJVU0VSX1JFQURfQUxMIiwiQU5BTFlUSUNTX1JFQUQiLCJBTkFMWVRJQ1NfVklFV19BTEwiLCJBVURJVF9MT0dTIiwiTUVNQkVSX0RBVEFfUkVBRF9BTEwiLCJNRU1CRVJfREFUQV9DUkVBVEUiLCJNRU1CRVJfREFUQV9VUERBVEUiLCJNRU1CRVJfREFUQV9ERUxFVEUiXSwiaWF0IjoxNzU1NTA2NTk4LCJleHAiOjE3NTU1OTI5OTgsImlzcyI6Im11ZmctcGVuc2lvbi1pbnNpZ2h0cyIsImF1ZCI6Im11ZmctYXBpIn0.-jL53WF1KEq7GyoVCD5F4Z6vB5UeiXoedX_KTsnF9XQ"

# Start the server in background
echo "🚀 Starting backend server..."
cd /mnt/Project/Projects/mufg/backend
node app.js &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Test 1: Verify token works
echo ""
echo "🔐 Test 1: Verifying authentication token..."
AUTH_RESPONSE=$(curl -s -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Auth verification:"
echo "$AUTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$AUTH_RESPONSE"

# Test 2: Get pension data statistics
echo ""
echo "📊 Test 2: Getting pension data statistics..."
STATS_RESPONSE=$(curl -s -X GET http://localhost:4000/api/pension-data/stats/overview \
  -H "Authorization: Bearer $TOKEN")

echo "📈 Statistics Response:"
echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"

# Test 3: List pension data with pagination
echo ""
echo "📋 Test 3: Listing pension data (first 5 records)..."
LIST_RESPONSE=$(curl -s -X GET "http://localhost:4000/api/pension-data?limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "📄 List Response:"
echo "$LIST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LIST_RESPONSE"

# Test 4: Search pension data
echo ""
echo "🔍 Test 4: Searching pension data by country..."
SEARCH_RESPONSE=$(curl -s -X GET "http://localhost:4000/api/pension-data?country=USA&limit=3" \
  -H "Authorization: Bearer $TOKEN")

echo "🌎 Search Response:"
echo "$SEARCH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEARCH_RESPONSE"

# Test 5: Create new pension data record
echo ""
echo "➕ Test 5: Creating new pension data record..."
CREATE_DATA='{
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

CREATE_RESPONSE=$(curl -s -X POST http://localhost:4000/api/pension-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CREATE_DATA")

echo "🆕 Create Response:"
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"

# Extract created record ID for further testing
CREATED_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$CREATED_ID" ]; then
    echo "✅ Record created successfully with ID: $CREATED_ID"
    
    # Test 6: Get specific pension data by ID
    echo ""
    echo "🔍 Test 6: Getting specific pension data by ID..."
    GET_RESPONSE=$(curl -s -X GET "http://localhost:4000/api/pension-data/$CREATED_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "📖 Get Response:"
    echo "$GET_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_RESPONSE"
    
    # Test 7: Update pension data
    echo ""
    echo "✏️ Test 7: Updating pension data..."
    UPDATE_DATA='{
      "annual_income": 80000,
      "current_savings": 160000,
      "risk_tolerance": "Aggressive"
    }'
    
    UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:4000/api/pension-data/$CREATED_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$UPDATE_DATA")
    
    echo "📝 Update Response:"
    echo "$UPDATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_RESPONSE"
    
else
    echo "❌ Failed to create record, skipping further tests"
fi

# Test 8: Test API documentation
echo ""
echo "📚 Test 8: Checking API documentation..."
API_DOCS=$(curl -s -X GET http://localhost:4000/api)
echo "📖 API Documentation:"
echo "$API_DOCS" | python3 -m json.tool 2>/dev/null || echo "$API_DOCS"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "✨ Testing completed!"
echo "================================================"
