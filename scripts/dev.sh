#!/bin/bash

# MUFG Project Development Launcher
# Quick start script for both frontend and backend development servers

echo "🚀 MUFG Pension Insights Platform - Development Launcher"
echo "======================================================"

# Navigate to project root
PROJECT_ROOT="/mnt/Project/Projects/MUFG"
cd "$PROJECT_ROOT"

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup on script exit
trap cleanup SIGINT SIGTERM

echo ""
echo "📋 Frontend will be available at: http://localhost:3000"
echo "📋 Backend API will be available at: http://localhost:4000"
echo "� API Documentation: http://localhost:4000/api-docs"
echo ""

# Start backend server in background
echo "🚀 Starting Backend API Server..."
cd "$PROJECT_ROOT/backend" && pnpm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server in background
echo "� Starting Frontend Development Server..."
cd "$PROJECT_ROOT/frontend" && pnpm run dev &
FRONTEND_PID=$!

# Wait for both processes
echo ""
echo "✅ Both servers are starting..."
echo "🔄 Watching for changes..."
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
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
