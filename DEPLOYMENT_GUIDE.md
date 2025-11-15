# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub account with repository

### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "Production ready v1.0"
git push origin main
```

2. **Connect Vercel**
   - Go to vercel.com/new
   - Import your GitHub repository
   - Select "Next.js" framework preset
   - Click Deploy

3. **Configure Environment Variables**
   - Go to project settings > Environment Variables
   - Add `NEXT_PUBLIC_GENKIT_API_KEY` with your Google AI key

4. **Done!**
   - Your app is now live at `your-project.vercel.app`

---

## Self-Hosted Deployment

### Prerequisites
- Linux server (Ubuntu 22.04+ recommended)
- Node.js 20+
- npm or yarn
- Port 3000 available

### Installation

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone <your-repo-url>
cd link-saver

# Install dependencies
npm install --legacy-peer-deps

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_GENKIT_API_KEY=your_api_key_here
NODE_ENV=production
EOF

# Build
npm run build

# Test run
npm start
# Press Ctrl+C to stop
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'link-saver',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable restart on reboot
pm2 startup
```

### Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx config
sudo cat > /etc/nginx/sites-available/link-saver << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/link-saver /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo systemctl restart nginx
```

---

## Docker Deployment

### Build Docker Image

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

Create `.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.next
```

### Build and Run

```bash
# Build image
docker build -t link-saver:latest .

# Run container
docker run -d \
  --name link-saver \
  -p 3000:3000 \
  -e NEXT_PUBLIC_GENKIT_API_KEY=your_key \
  -e NODE_ENV=production \
  link-saver:latest

# Check logs
docker logs -f link-saver

# Stop container
docker stop link-saver
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  link-saver:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_GENKIT_API_KEY: ${GENKIT_API_KEY}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - link-saver
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Deploy with Docker Compose

```bash
# Set environment variable
export GENKIT_API_KEY=your_key_here

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci --legacy-peer-deps

    - name: Type check
      run: npm run typecheck

    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_GENKIT_API_KEY: ${{ secrets.GENKIT_API_KEY }}

    - name: Deploy to Vercel
      uses: vercel/action@v4
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# Use PM2 monitoring
pm2 monit

# Check app status
pm2 status

# View recent logs
pm2 logs link-saver --lines 100
```

### System Monitoring

```bash
# CPU and Memory
top

# Disk usage
df -h

# Check port usage
lsof -i :3000
```

### Application Logs

Logs stored in `./logs/`:
- `out.log` - Standard output
- `error.log` - Error messages

View in real-time:
```bash
tail -f logs/error.log
```

---

## Scaling

### For High Traffic

1. **Use PM2 Cluster Mode** (already configured above)
2. **Add Load Balancer** (Nginx, HAProxy)
3. **Implement Caching** (Redis)
4. **Use CDN** (Cloudflare, CloudFront)
5. **Database** (Migrate from localStorage to PostgreSQL/MongoDB)

### Database Migration

When ready to scale:

```bash
# Install database driver
npm install @prisma/client prisma

# Setup Prisma
npx prisma init

# Create schema and migrations
npx prisma migrate dev

# Update API endpoints to use database
```

---

## Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] Use HTTPS in production
- [ ] Enable CORS headers appropriately
- [ ] Implement rate limiting
- [ ] Add API key validation
- [ ] Enable security headers (Content-Security-Policy, etc.)
- [ ] Regular security audits (`npm audit`)
- [ ] Keep dependencies updated
- [ ] Backup data regularly
- [ ] Monitor error logs

---

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### High CPU Usage
- Check PM2 logs: `pm2 logs`
- Restart app: `pm2 restart link-saver`
- Scale horizontally with load balancer

### Slow API Response
- Check network connectivity
- Verify Google AI API key
- Check server resources
- Add monitoring

---

## Backup & Recovery

### Manual Backup
```bash
# Backup .env and database
tar -czf backup-$(date +%Y%m%d).tar.gz .env.local

# Store in safe location
scp backup-*.tar.gz backup-server:/backups/
```

### Automated Backups (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/user/backup.sh

# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
tar -czf /backups/link-saver-$(date +\%Y\%m\%d).tar.gz /app/.env.local
EOF

chmod +x ~/backup.sh
```

---

## Support

For deployment issues:
1. Check the logs: `pm2 logs link-saver`
2. Test health endpoint: `curl http://localhost:3000/api/health`
3. Verify environment variables are set
4. Check firewall rules
5. Consult server documentation

---

**Last Updated**: November 15, 2025
