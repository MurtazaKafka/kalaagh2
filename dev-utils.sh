#!/bin/bash

# Kalaagh Development Utilities

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Show menu
show_menu() {
    echo -e "${CYAN}
╔════════════════════════════════════════════════╗
║     Kalaagh Development Utilities Menu         ║
╚════════════════════════════════════════════════╝${NC}"
    
    echo -e "
${GREEN}Server Management:${NC}
  1) Start all servers (with monitoring)
  2) Start servers (quick mode)
  3) Stop all servers
  4) Restart servers
  5) Show server status

${BLUE}Database Operations:${NC}
  6) Run migrations
  7) Rollback migrations
  8) Seed database
  9) Reset database

${YELLOW}Content Management:${NC}
  10) Sync educational content
  11) Check download queue
  12) Clear content cache

${CYAN}Development Tools:${NC}
  13) View logs
  14) Run tests
  15) Build for production
  16) Check code quality

${RED}Utilities:${NC}
  17) Clean node_modules
  18) Update dependencies
  19) Generate API docs
  20) Open in browser

  0) Exit
"
    echo -n "Select an option: "
}

# Check server status
check_status() {
    echo -e "\n${BLUE}Server Status:${NC}"
    
    # Backend
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "Backend:  ${GREEN}● Running${NC} on port 3001"
    else
        echo -e "Backend:  ${RED}○ Stopped${NC}"
    fi
    
    # Frontend
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "Frontend: ${GREEN}● Running${NC} on port 5173"
    else
        echo -e "Frontend: ${RED}○ Stopped${NC}"
    fi
    
    # Database
    if [ -f "database/dev.db" ]; then
        SIZE=$(du -h database/dev.db | cut -f1)
        echo -e "Database: ${GREEN}● Exists${NC} ($SIZE)"
    else
        echo -e "Database: ${RED}○ Not found${NC}"
    fi
}

# View logs
view_logs() {
    echo -e "\n${BLUE}Select log to view:${NC}"
    echo "1) Backend logs"
    echo "2) Frontend logs"
    echo "3) Both (split screen)"
    echo -n "Choice: "
    read choice
    
    case $choice in
        1) tail -f backend.log ;;
        2) tail -f frontend.log ;;
        3) 
            # Use tmux if available
            if command -v tmux &> /dev/null; then
                tmux new-session -d -s logs
                tmux split-window -h
                tmux send-keys -t logs:0.0 'tail -f backend.log' C-m
                tmux send-keys -t logs:0.1 'tail -f frontend.log' C-m
                tmux attach-session -t logs
            else
                echo "Installing tmux for split view..."
                tail -f backend.log frontend.log
            fi
            ;;
    esac
}

# Sync content
sync_content() {
    echo -e "\n${BLUE}Syncing educational content...${NC}"
    curl -X POST http://localhost:3001/api/v1/integrations/sync \
         -H "Content-Type: application/json" \
         -d '{"gradeLevel": "8", "subject": "all"}'
    echo -e "\n${GREEN}Content sync initiated${NC}"
}

# Reset database
reset_database() {
    echo -e "\n${RED}Warning: This will delete all data!${NC}"
    echo -n "Are you sure? (yes/no): "
    read confirm
    
    if [ "$confirm" = "yes" ]; then
        cd database
        npm run migrate:rollback -- --all
        npm run migrate:latest
        npm run seed:run
        cd ..
        echo -e "${GREEN}Database reset complete${NC}"
    else
        echo "Cancelled"
    fi
}

# Open in browser
open_browser() {
    echo -e "\n${BLUE}Opening in browser...${NC}"
    
    # Detect OS and use appropriate command
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open http://localhost:5173
        open http://localhost:3001/api/docs
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open http://localhost:5173
        xdg-open http://localhost:3001/api/docs
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start http://localhost:5173
        start http://localhost:3001/api/docs
    fi
}

# Clean dependencies
clean_deps() {
    echo -e "\n${YELLOW}Cleaning node_modules...${NC}"
    rm -rf node_modules backend/node_modules frontend/node_modules database/node_modules
    echo -e "${GREEN}Cleaned!${NC}"
    
    echo -e "\n${BLUE}Reinstalling dependencies...${NC}"
    npm install
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
    cd database && npm install && cd ..
    echo -e "${GREEN}Dependencies reinstalled${NC}"
}

# Main loop
while true; do
    show_menu
    read option
    
    case $option in
        1) ./start-dev.sh ;;
        2) ./dev.sh ;;
        3) ./stop-dev.sh ;;
        4) ./stop-dev.sh && sleep 2 && ./start-dev.sh ;;
        5) check_status ;;
        6) cd database && npm run migrate:latest && cd .. ;;
        7) cd database && npm run migrate:rollback && cd .. ;;
        8) cd database && npm run seed:run && cd .. ;;
        9) reset_database ;;
        10) sync_content ;;
        11) curl http://localhost:3001/api/v1/integrations/downloads/status ;;
        12) rm -rf content/* && echo "Content cache cleared" ;;
        13) view_logs ;;
        14) cd backend && npm test && cd ../frontend && npm test && cd .. ;;
        15) ./deploy.sh ;;
        16) cd backend && npm run lint && cd ../frontend && npm run lint && cd .. ;;
        17) clean_deps ;;
        18) npm update && cd backend && npm update && cd ../frontend && npm update && cd .. ;;
        19) cd backend && npm run docs:generate && cd .. ;;
        20) open_browser ;;
        0) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
    
    echo -e "\n${YELLOW}Press Enter to continue...${NC}"
    read
    clear
done