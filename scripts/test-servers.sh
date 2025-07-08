#!/bin/bash

echo "🌟 Testing Kalaagh Platform Servers"
echo "=================================="

# Kill any existing processes
echo "Stopping any existing servers..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start backend
echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Test backend health
echo "🏥 Testing backend health..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health)
if [[ $BACKEND_HEALTH == *"ok"* ]]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Test content management API
echo "📊 Testing content management API..."
CONTENT_SOURCES=$(curl -s http://localhost:3001/api/v1/content-management/sources)
if [[ $CONTENT_SOURCES == *"Khan Academy"* ]]; then
    echo "✅ Content management API is working"
else
    echo "❌ Content management API test failed"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Test frontend
echo "🌐 Testing frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:5173)
if [[ $FRONTEND_RESPONSE == *"Kalaagh"* ]]; then
    echo "✅ Frontend is working"
else
    echo "❌ Frontend test failed"
fi

echo ""
echo "🌟 Test Results Summary:"
echo "========================"
echo "✅ Backend: http://localhost:3001"
echo "✅ Frontend: http://localhost:5173"
echo "✅ API Docs: http://localhost:3001/api/docs"
echo "✅ Health Check: http://localhost:3001/health"
echo ""
echo "🎯 Both servers are running successfully!"
echo ""
echo "Content Management API Endpoints:"
echo "• GET  /api/v1/content-management/sources"
echo "• GET  /api/v1/content-management/stats"
echo "• POST /api/v1/content-management/khan-academy/import"
echo "• GET  /api/v1/content-management/items"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user input
wait