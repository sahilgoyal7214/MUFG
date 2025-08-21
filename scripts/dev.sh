#!/bin/bash

# MUFG Project Development Launcher
# Quick start script for development environment

echo "🚀 MUFG Pension Insights Platform - Development Launcher"
echo "======================================================"

# Navigate to project root
cd /mnt/Project/Projects/mufg/backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo ""
echo "🌟 Available Commands:"
echo "  1. start     - Start development server with nodemon"
echo "  2. test      - Run test suite"
echo "  3. docs      - Open API documentation"
echo "  4. logs      - View recent logs"
echo "  5. cleanup   - Run project cleanup"
echo "  6. status    - Show project status"
echo ""

read -p "Choose an option (1-6) or press Enter to start server: " choice

case $choice in
    1|"")
        echo "🔥 Starting development server..."
        npm run dev
        ;;
    2)
        echo "🧪 Running tests..."
        npm test
        ;;
    3)
        echo "📚 Opening API documentation..."
        echo "Visit: http://localhost:4000/api-docs"
        ;;
    4)
        echo "📋 Recent logs:"
        tail -20 logs/server.log 2>/dev/null || echo "No server logs found"
        ;;
    5)
        echo "🧹 Running cleanup..."
        cd .. && bash scripts/cleanup.sh
        ;;
    6)
        echo "📊 Project Status:"
        cat ../PROJECT-STATUS.md | head -20
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac
