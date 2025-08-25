#!/bin/bash

# Script to switch from auth-test.js to auth.js middleware
# This removes the test authentication and uses production-ready auth

echo "🔄 Switching backend from test authentication to production authentication..."

# List of files that need to be updated
files=(
    "/mnt/Project/Projects/MUFG/backend/src/routes/auth.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/users.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/members.js" 
    "/mnt/Project/Projects/MUFG/backend/src/routes/pensionData.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/chatbot.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/analytics.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/logs.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/kpi.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/advisor.js"
    "/mnt/Project/Projects/MUFG/backend/src/routes/graph-insights.js"
)

echo "Files to update:"
for file in "${files[@]}"; do
    echo "  - $(basename "$file")"
done

echo ""
echo "⚠️  This will:"
echo "  - Remove fixed test token access"
echo "  - Require real NextAuth JWT tokens"
echo "  - Use production authentication middleware"
echo ""
echo "✅ After this change:"
echo "  - Users must login through NextAuth to get valid JWT tokens"
echo "  - Fixed test token will no longer work"
echo "  - System will be production-ready for authentication"
echo ""
echo "Run this script manually to proceed with the changes."
