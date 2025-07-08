#!/bin/bash

# Kalaagh Educational Platform Deployment Script

echo "🚀 Deploying Kalaagh Educational Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}Checking requirements...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed. Please install Node.js 20.x or higher.${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed. Please install npm.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}Building frontend...${NC}"
    cd frontend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
}

# Build backend
build_backend() {
    echo -e "${BLUE}Building backend...${NC}"
    cd backend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}✓ Backend built successfully${NC}"
}

# Run migrations
run_migrations() {
    echo -e "${BLUE}Running database migrations...${NC}"
    cd database
    npm run migrate:latest
    npm run seed:run
    cd ..
    echo -e "${GREEN}✓ Database migrations completed${NC}"
}

# Create production environment file
create_env() {
    echo -e "${BLUE}Creating production environment file...${NC}"
    
    if [ ! -f backend/.env.production ]; then
        cat > backend/.env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://kalaagh:password@localhost:5432/kalaagh_production

# Security
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://kalaagh.org
CORS_CREDENTIALS=true

# Content Storage
CONTENT_DIR=/var/kalaagh/content
MAX_CONCURRENT_DOWNLOADS=5

# API Keys (Add your actual keys)
KHAN_ACADEMY_API_KEY=
CK12_API_KEY=

# Logging
LOG_LEVEL=info
EOF
        echo -e "${GREEN}✓ Environment file created (Please update with actual values)${NC}"
    else
        echo -e "${GREEN}✓ Environment file already exists${NC}"
    fi
}

# Deploy with PM2
deploy_pm2() {
    echo -e "${BLUE}Deploying with PM2...${NC}"
    
    # Install PM2 globally if not installed
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'kalaagh-backend',
      script: './backend/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
EOF
    
    # Start/restart application
    pm2 stop kalaagh-backend 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo -e "${GREEN}✓ Application deployed with PM2${NC}"
}

# Setup Nginx configuration
setup_nginx() {
    echo -e "${BLUE}Creating Nginx configuration...${NC}"
    
    cat > nginx.conf << EOF
server {
    listen 80;
    server_name kalaagh.org www.kalaagh.org;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kalaagh.org www.kalaagh.org;
    
    # SSL Configuration (Update paths)
    ssl_certificate /etc/ssl/certs/kalaagh.crt;
    ssl_certificate_key /etc/ssl/private/kalaagh.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {
        root /var/www/kalaagh/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Service Worker
    location /service-worker.js {
        root /var/www/kalaagh/frontend/dist;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Static content
    location /content {
        alias /var/kalaagh/content;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    echo -e "${GREEN}✓ Nginx configuration created${NC}"
    echo -e "${BLUE}Copy nginx.conf to /etc/nginx/sites-available/kalaagh and create symlink${NC}"
}

# Create systemd service
create_systemd_service() {
    echo -e "${BLUE}Creating systemd service...${NC}"
    
    cat > kalaagh.service << EOF
[Unit]
Description=Kalaagh Educational Platform
Documentation=https://github.com/kalaagh/platform
After=network.target

[Service]
Type=forking
User=kalaagh
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
PIDFile=/home/kalaagh/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/local/bin/pm2 start /home/kalaagh/kalaagh2/ecosystem.config.js --env production
ExecReload=/usr/local/bin/pm2 reload all
ExecStop=/usr/local/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF
    
    echo -e "${GREEN}✓ Systemd service created${NC}"
    echo -e "${BLUE}Copy kalaagh.service to /etc/systemd/system/ and enable it${NC}"
}

# Main deployment process
main() {
    echo -e "${GREEN}
╔═══════════════════════════════════════════╗
║   Kalaagh Educational Platform Deployment ║
╚═══════════════════════════════════════════╝${NC}"
    
    check_requirements
    create_env
    run_migrations
    build_backend
    build_frontend
    deploy_pm2
    setup_nginx
    create_systemd_service
    
    echo -e "${GREEN}
╔═══════════════════════════════════════════╗
║         Deployment Completed! 🎉          ║
╚═══════════════════════════════════════════╝${NC}"
    
    echo -e "${BLUE}
Next steps:
1. Update backend/.env.production with actual values
2. Copy nginx.conf to /etc/nginx/sites-available/
3. Set up SSL certificates
4. Copy systemd service file and enable it
5. Create 'kalaagh' user for running the service
6. Set up content directory permissions
7. Configure firewall rules
8. Set up monitoring and backups
${NC}"
    
    echo -e "${GREEN}Access your application at:
- Frontend: http://localhost:5173 (development)
- Backend API: http://localhost:3001/api/v1
- API Docs: http://localhost:3001/api/docs${NC}"
}

# Run main function
main