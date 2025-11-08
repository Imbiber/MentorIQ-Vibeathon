#!/bin/bash

echo "🚀 Starting MentorIQ Development Environment..."
echo ""

# Change to MentorIQ directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your credentials."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Environment ready!"
echo ""
echo "Starting services..."
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend App: http://localhost:8080"
echo ""

# Start both frontend and backend
npm run dev:full
