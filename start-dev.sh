#!/bin/bash

# Kalaagh Educational Platform - Development Server Startup Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3001
FRONTEND_PORT=5173
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    
    # Kill backend server
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Backend server stopped${NC}"
    fi
    
    # Kill frontend server
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Frontend server stopped${NC}"
    fi
    
    # Kill any remaining processes on the ports
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
    
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT TERM

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for server to start
wait_for_server() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}Waiting for $name to start on port $port...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✓ $name is running on port $port${NC}"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo -e "\n${RED}✗ $name failed to start${NC}"
    return 1
}

# Main script
echo -e "${GREEN}
╔════════════════════════════════════════════════╗
║   Kalaagh Educational Platform - Dev Server    ║
╚════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Project root: $PROJECT_ROOT${NC}"

# Check if servers are already running
if check_port $BACKEND_PORT; then
    echo -e "${YELLOW}⚠ Backend server already running on port $BACKEND_PORT${NC}"
    echo -n "Kill existing process? (y/n): "
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
        sleep 2
    else
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
fi

if check_port $FRONTEND_PORT; then
    echo -e "${YELLOW}⚠ Frontend server already running on port $FRONTEND_PORT${NC}"
    echo -n "Kill existing process? (y/n): "
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
        sleep 2
    else
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
fi

# Check Node.js version
echo -e "\n${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Install dependencies if needed
echo -e "\n${BLUE}Checking dependencies...${NC}"

# Backend dependencies
if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$PROJECT_ROOT/backend"
    npm install
    cd "$PROJECT_ROOT"
fi

# Frontend dependencies
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm install
    cd "$PROJECT_ROOT"
fi

# Database dependencies
if [ ! -d "$PROJECT_ROOT/database/node_modules" ]; then
    echo -e "${YELLOW}Installing database dependencies...${NC}"
    cd "$PROJECT_ROOT/database"
    npm install
    cd "$PROJECT_ROOT"
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run database migrations
echo -e "\n${BLUE}Running database migrations...${NC}"
cd "$PROJECT_ROOT/database"
npm run migrate:latest
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${RED}✗ Database migration failed${NC}"
    exit 1
fi

# Seed database if empty
if [ -f "$PROJECT_ROOT/database/dev.db" ]; then
    SUBJECTS_COUNT=$(sqlite3 "$PROJECT_ROOT/database/dev.db" "SELECT COUNT(*) FROM subjects;" 2>/dev/null || echo "0")
    if [ "$SUBJECTS_COUNT" -eq "0" ]; then
        echo -e "${BLUE}Seeding database...${NC}"
        npm run seed:run
        echo -e "${GREEN}✓ Database seeded${NC}"
    fi
fi

cd "$PROJECT_ROOT"

# Start backend server
echo -e "\n${BLUE}Starting backend server...${NC}"
cd "$PROJECT_ROOT/backend"
npm run dev > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Wait for backend to start
if wait_for_server $BACKEND_PORT "Backend server"; then
    echo -e "${GREEN}✓ Backend API: http://localhost:$BACKEND_PORT${NC}"
    echo -e "${GREEN}✓ API Docs: http://localhost:$BACKEND_PORT/api/docs${NC}"
else
    echo -e "${RED}Backend failed to start. Check backend.log for details.${NC}"
    cat "$PROJECT_ROOT/backend.log"
    cleanup
    exit 1
fi

# Start frontend server
echo -e "\n${BLUE}Starting frontend server...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

# Wait for frontend to start
if wait_for_server $FRONTEND_PORT "Frontend server"; then
    echo -e "${GREEN}✓ Frontend: http://localhost:$FRONTEND_PORT${NC}"
else
    echo -e "${RED}Frontend failed to start. Check frontend.log for details.${NC}"
    cat "$PROJECT_ROOT/frontend.log"
    cleanup
    exit 1
fi

# Display success message
echo -e "\n${GREEN}
╔════════════════════════════════════════════════╗
║        All servers started successfully! 🚀    ║
╚════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Access points:${NC}"
echo -e "  Frontend:    ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:$BACKEND_PORT/api/v1${NC}"
echo -e "  API Docs:    ${GREEN}http://localhost:$BACKEND_PORT/api/docs${NC}"
echo -e "  Health:      ${GREEN}http://localhost:$BACKEND_PORT/health${NC}"

echo -e "\n${BLUE}Logs:${NC}"
echo -e "  Backend:  $PROJECT_ROOT/backend.log"
echo -e "  Frontend: $PROJECT_ROOT/frontend.log"

echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Function to display logs
show_logs() {
    echo -e "\n${BLUE}Showing recent logs...${NC}"
    echo -e "\n${YELLOW}=== Backend Logs ===${NC}"
    tail -n 20 "$PROJECT_ROOT/backend.log"
    echo -e "\n${YELLOW}=== Frontend Logs ===${NC}"
    tail -n 20 "$PROJECT_ROOT/frontend.log"
}

# Monitor servers
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "\n${RED}Backend server crashed!${NC}"
        show_logs
        cleanup
        exit 1
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "\n${RED}Frontend server crashed!${NC}"
        show_logs
        cleanup
        exit 1
    fi
    
    # Check for user input
    read -t 1 -n 1 key
    if [[ $key = "l" ]]; then
        show_logs
    elif [[ $key = "r" ]]; then
        echo -e "\n${YELLOW}Restarting servers...${NC}"
        cleanup
        exec "$0"
    elif [[ $key = "h" ]]; then
        echo -e "\n${BLUE}Commands:${NC}"
        echo -e "  l - Show recent logs"
        echo -e "  r - Restart all servers"
        echo -e "  h - Show this help"
        echo -e "  Ctrl+C - Stop all servers"
    fi
done