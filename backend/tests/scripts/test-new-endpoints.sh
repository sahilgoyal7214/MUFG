#!/bin/bash

# Test script for new advisor endpoints
# Uses the fixed test token from auth-test.js

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJURVNUMDAxIiwiZW1haWwiOiJ0ZXN0QG11ZmcuY29tIiwicm9sZSI6InJlZ3VsYXRvciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJtZW1iZXJJZCI6IlRFU1QwMDEiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyOnJlYWQ6YWxsIiwiYW5hbHl0aWNzOnJlYWQiLCJhbmFseXRpY3M6dmlldzphbGwiLCJhbmFseXRpY3M6dmlldzpvd24iLCJhbmFseXRpY3M6dmlldzphc3NpZ25lZCIsImFuYWx5dGljczpleHBvcnQiLCJhdWRpdDpsb2dzIiwibWVtYmVyX2RhdGE6cmVhZDphbGwiLCJtZW1iZXJfZGF0YTpjcmVhdGUiLCJtZW1iZXJfZGF0YTp1cGRhdGUiLCJtZW1iZXJfZGF0YTpkZWxldGUiLCJjaGF0Ym90OmFjY2VzcyIsInJlZ3VsYXRvcnk6b3ZlcnNpZ2h0IiwiY29tcGxpYW5jZTptb25pdG9yaW5nIiwiY29tcGxpYW5jZTpyZXBvcnRzIl0sImlhdCI6MTc1NTUxMjUyMCwiZXhwIjoxNzg3MDQ4NTIwLCJpc3MiOiJtdWZnLXBlbnNpb24taW5zaWdodHMiLCJhdWQiOiJtdWZnLWFwaSJ9.b6WGVaUMETbPoaaDcFDEcCiwLWGcMGcsOO2OPbQHZD0"

BASE_URL="http://localhost:4000/api"

echo "🧪 Testing New Advisor Endpoints"
echo "================================="

# Test 1: Health Check
echo "1. Testing Advisor Health Endpoint"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/advisor/health"
echo ""

# Test 2: Portfolio Optimization
echo "2. Testing Portfolio Optimization for User 1"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/advisor/portfolio-optimization/1"
echo ""

# Test 3: Portfolio Rebalancing
echo "3. Testing Portfolio Rebalancing for User 1"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/advisor/portfolio-rebalancing/1"
echo ""

# Test 4: Member Segmentation
echo "4. Testing Member Segmentation"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"segments": 3, "features": ["age", "balance", "contributions"]}' \
  "$BASE_URL/advisor/member-segmentation"
echo ""

# Test 5: Risk Alerts
echo "5. Testing Risk Alerts for User 1"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/advisor/risk-alerts/1"
echo ""

# Test 6: Contribution Recommendations
echo "6. Testing Contribution Recommendations for User 1"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/advisor/contribution-recommendations/1"
echo ""

# Test 7: Dashboard
echo "7. Testing Advisor Dashboard for User 1"
curl -s -w "HTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/advisor/dashboard/1"
echo ""

echo "🏁 Testing Complete!"
