#!/bin/bash

# Test script for MUFG Chatbot with Local LLM Integration
# This script tests the chatbot functionality with and without LLM

echo "🤖 Testing MUFG Chatbot with Local LLM Integration"
echo "=================================================="

# First, test withbackend/src/configout authentication (should fail)
echo ""
echo "1. Testing without authentication (should fail):"
curl -s -X POST http://localhost:4000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can you help me?"}' | jq '.'

# Test with a mock JWT token (will fail auth but show the endpoint structure)
echo ""
echo "2. Testing with invalid token (shows API structure):"
curl -s -X POST http://localhost:4000/api/chatbot/message \
  -H "Authorization: Bearer fake-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my pension balance?"}' | jq '.'

echo ""
echo "3. Testing chatbot capabilities endpoint:"
curl -s -X GET http://localhost:4000/api/chatbot/capabilities \
  -H "Authorization: Bearer fake-token" | jq '.'

echo ""
echo "📊 LLM Integration Status:"
echo "========================="

# Check if LOCAL_LLM_URL is configured
if [ -n "$LOCAL_LLM_URL" ]; then
    echo "✅ LOCAL_LLM_URL configured: $LOCAL_LLM_URL"
    
    # Test if LLM server is reachable
    if curl -s --connect-timeout 5 "$LOCAL_LLM_URL" > /dev/null 2>&1; then
        echo "✅ LLM server is reachable"
    else
        echo "❌ LLM server is not reachable (will use fallback responses)"
    fi
else
    echo "⚠️  LOCAL_LLM_URL not configured (will use structured responses only)"
fi

echo ""
echo "🔍 Testing Instructions:"
echo "======================="
echo "1. To test with authentication, first log in via /api/auth/login"
echo "2. Use the returned JWT token in the Authorization header"
echo "3. Set up a local LLM server at the configured URL for enhanced responses"
echo "4. Monitor server logs to see response sources (local_llm, llm_enhanced, fallback)"

echo ""
echo "💡 Example with authentication:"
echo "curl -X POST http://localhost:4000/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"user@example.com\",\"password\":\"password\"}'"
echo ""
echo "curl -X POST http://localhost:4000/api/chatbot/message \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"How should I plan for retirement?\"}'"
