#!/bin/bash

# Kalaagh Production Build Script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}
╔════════════════════════════════════════════════╗
║     Kalaagh Production Build Script            ║
╚════════════════════════════════════════════════╝${NC}"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18 or higher is required${NC}"
    exit 1
fi

# Clean previous builds
echo -e "\n${BLUE}Cleaning previous builds...${NC}"
rm -rf backend/dist frontend/dist
echo -e "${GREEN}✓ Cleaned${NC}"

# Install dependencies
echo -e "\n${BLUE}Installing production dependencies...${NC}"
cd backend && npm ci --production=false && cd ..
cd frontend && npm ci && cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run tests
echo -e "\n${BLUE}Running tests...${NC}"
cd backend && npm test && cd ..
if [ $? -ne 0 ]; then
    echo -e "${RED}Backend tests failed!${NC}"
    exit 1
fi

cd frontend && npm test -- --run && cd ..
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend tests failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All tests passed${NC}"

# Build backend
echo -e "\n${BLUE}Building backend...${NC}"
cd backend && npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Backend build failed!${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Backend built${NC}"

# Build frontend
echo -e "\n${BLUE}Building frontend...${NC}"
cd frontend && npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Frontend built${NC}"

# Create production package
echo -e "\n${BLUE}Creating production package...${NC}"
mkdir -p dist
cp -r backend/dist dist/backend
cp -r frontend/dist dist/frontend
cp -r database dist/
cp package*.json dist/
cp deploy.sh dist/
cp Dockerfile dist/
cp docker-compose.yml dist/
cp nginx.conf dist/ 2>/dev/null || true

# Create production README
cat > dist/README.md << EOF
# Kalaagh Production Build

Built on: $(date)
Node version: $(node -v)

## Deployment

1. Copy this directory to your server
2. Run: ./deploy.sh
3. Follow the deployment instructions

## Contents
- backend/ - Compiled backend code
- frontend/ - Built frontend assets
- database/ - Database migrations and seeds
- deploy.sh - Deployment script
- Dockerfile - Docker configuration
- docker-compose.yml - Docker Compose configuration
EOF

# Create tarball
echo -e "\n${BLUE}Creating deployment package...${NC}"
tar -czf kalaagh-production-$(date +%Y%m%d-%H%M%S).tar.gz dist/
echo -e "${GREEN}✓ Created deployment package${NC}"

# Summary
echo -e "\n${GREEN}
╔════════════════════════════════════════════════╗
║         Build Completed Successfully! 🎉       ║
╚════════════════════════════════════════════════╝${NC}"

echo -e "
${BLUE}Build Summary:${NC}
- Backend built: ${GREEN}✓${NC}
- Frontend built: ${GREEN}✓${NC}
- Tests passed: ${GREEN}✓${NC}
- Package created: ${GREEN}✓${NC}

${YELLOW}Next steps:${NC}
1. Upload the .tar.gz file to your server
2. Extract and run ./deploy.sh
3. Configure environment variables
4. Set up SSL certificates
"