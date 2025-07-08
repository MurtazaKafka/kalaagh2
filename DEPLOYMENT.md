# Kalaagh Educational Platform - Deployment Guide

## Quick Start

The platform is now running locally:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

## Deployment Options

### Option 1: Traditional Deployment (Recommended for Production)

1. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

2. **Configure environment variables**:
   Edit `backend/.env.production` with your actual values:
   - Database credentials
   - API keys for educational platforms
   - JWT secret
   - Content directory path

3. **Set up the database**:
   ```bash
   cd database
   npm run migrate:latest
   npm run seed:run
   ```

4. **Deploy with PM2**:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/kalaagh
   sudo ln -s /etc/nginx/sites-available/kalaagh /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

2. **Run migrations**:
   ```bash
   docker-compose exec app npm run migrate:latest
   docker-compose exec app npm run seed:run
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

### Option 3: Cloud Deployment

#### AWS EC2
1. Launch an Ubuntu 22.04 instance
2. Install Node.js 20.x, PostgreSQL, and Nginx
3. Clone the repository
4. Follow Option 1 steps

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build commands:
   - Backend: `cd backend && npm install && npm run build`
   - Frontend: `cd frontend && npm install && npm run build`
3. Set environment variables
4. Deploy

## Production Checklist

### Security
- [ ] Update all default passwords
- [ ] Configure SSL certificates (Let's Encrypt recommended)
- [ ] Set up firewall rules (allow only 80, 443, 22)
- [ ] Enable fail2ban for SSH protection
- [ ] Configure CORS properly
- [ ] Set secure headers in Nginx

### Performance
- [ ] Enable Gzip compression in Nginx
- [ ] Set up CDN for static assets (CloudFlare recommended)
- [ ] Configure Redis for session storage
- [ ] Enable HTTP/2 in Nginx
- [ ] Set up proper caching headers

### Monitoring
- [ ] Install monitoring (Prometheus + Grafana)
- [ ] Set up log aggregation (ELK stack or CloudWatch)
- [ ] Configure health check alerts
- [ ] Monitor disk space for content storage
- [ ] Track API usage and performance

### Backup
- [ ] Daily database backups to S3
- [ ] Weekly full content backup
- [ ] Test restore procedures monthly
- [ ] Document recovery procedures

## Content Storage

### Local Storage
```bash
# Create content directory
sudo mkdir -p /var/kalaagh/content
sudo chown -R kalaagh:kalaagh /var/kalaagh/content

# Set permissions
sudo chmod -R 755 /var/kalaagh/content
```

### S3 Storage (Recommended for Scale)
```javascript
// Configure in backend/.env.production
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET=kalaagh-content
```

## Maintenance

### Daily Tasks
- Check application health
- Monitor error logs
- Review disk space

### Weekly Tasks
- Update content from educational platforms
- Review cultural adaptation flags
- Check translation queue
- Analyze bandwidth usage

### Monthly Tasks
- Security updates
- Performance optimization
- User feedback review
- Content quality audit

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs kalaagh-backend

# Check port availability
lsof -i :3001

# Verify database connection
psql -U kalaagh -d kalaagh_production -c "SELECT 1;"
```

### Frontend build fails
```bash
# Clear cache
rm -rf frontend/node_modules frontend/dist
cd frontend && npm install && npm run build
```

### Database migration errors
```bash
# Rollback and retry
cd database
npm run migrate:rollback
npm run migrate:latest
```

### Content download issues
```bash
# Check content directory permissions
ls -la /var/kalaagh/content

# Monitor download queue
curl http://localhost:3001/api/v1/integrations/downloads/status
```

## Support

For deployment support:
- GitHub Issues: https://github.com/kalaagh/platform
- Email: ops@kalaagh.org
- Documentation: https://docs.kalaagh.org

## Next Steps

1. Set up SSL certificates
2. Configure domain DNS
3. Enable monitoring
4. Create first admin user
5. Start content synchronization
6. Test offline functionality
7. Verify cultural adaptation
8. Launch! 🚀