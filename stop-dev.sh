#!/bin/bash

# Stop all Kalaagh development servers

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Stopping Kalaagh development servers...${NC}"

# Kill processes on specific ports
PORTS=(3001 5173)

for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti:$PORT)
    if [ ! -z "$PID" ]; then
        echo -e "Stopping process on port $PORT (PID: $PID)"
        kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✓ Stopped${NC}"
    else
        echo -e "No process found on port $PORT"
    fi
done

# Kill any npm/node processes related to the project
echo -e "\n${YELLOW}Cleaning up npm processes...${NC}"
ps aux | grep -E "npm.*dev|tsx.*watch" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

echo -e "\n${GREEN}All servers stopped!${NC}"