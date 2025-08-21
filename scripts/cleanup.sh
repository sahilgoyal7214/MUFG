#!/bin/bash

# MUFG Project Cleanup and Maintenance Script
# This script performs routine cleanup and organization tasks

echo "🧹 Starting MUFG Project Cleanup..."

# Navigate to project root
cd /mnt/Project/Projects/mufg

# 1. Clean up old log files (older than 7 days)
echo "📁 Archiving old log files..."
find backend/logs -name "*.log" -mtime +7 -exec mv {} backend/logs/archive/ \; 2>/dev/null

# 2. Clean up any temporary files and unused backups
echo "🗑️  Removing temporary files and cleaning up backups..."
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.swp" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null

# Clean up any backup files that aren't in the reference directory
find backend/src -name "*-backup*" -not -path "*/reference/*" -delete 2>/dev/null
find backend/src -name "*-old*" -not -path "*/reference/*" -delete 2>/dev/null
find backend/src -name "*.bak" -not -path "*/reference/*" -delete 2>/dev/null

# 3. Ensure proper permissions
echo "🔒 Setting proper permissions..."
chmod +x backend/tests/scripts/*.sh 2>/dev/null
chmod +x backend/tools/*.js 2>/dev/null

# 4. Clean up empty directories
echo "📂 Removing empty directories..."
find . -type d -empty -delete 2>/dev/null

# 5. Show current project structure
echo "📊 Current project structure:"
tree -I 'node_modules|.git|archive' -L 2 2>/dev/null || echo "tree command not available"

echo "✅ Cleanup completed successfully!"
echo ""
echo "📋 Project Summary:"
echo "   Backend: $(find backend/src -name "*.js" | wc -l) JavaScript files"
echo "   Tests: $(find backend/tests -name "*.js" | wc -l) test files"
echo "   Documentation: $(find documentation -name "*.md" | wc -l) markdown files"
echo "   Active Logs: $(find backend/logs -name "*.log" -not -path "*/archive/*" | wc -l) log files"
