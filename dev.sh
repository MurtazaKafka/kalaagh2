#!/bin/bash

# Quick development server startup script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting Kalaagh Development Servers...${NC}"

# Kill existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd "$SCRIPT_DIR/backend" && npm run dev &
BACKEND_PID=$!

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

# Wait for servers
sleep 5

echo -e "${GREEN}
╔════════════════════════════════════════════════╗
║        Development servers started! 🚀         ║
╚════════════════════════════════════════════════╝${NC}"

echo -e "
Frontend:    ${GREEN}http://localhost:5173${NC}
Backend API: ${GREEN}http://localhost:3001${NC}
API Docs:    ${GREEN}http://localhost:3001/api/docs${NC}

Press Ctrl+C to stop servers
"

# Keep script running
wait $BACKEND_PID $FRONTEND_PID