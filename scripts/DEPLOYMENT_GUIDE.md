# Deployment Guide - TheSun Next.js Project

## Prerequisites on Server
- Node.js 18+ (LTS recommended)
- npm 8+
- Git (optional, for updates)

## Deployment Methods

### 1. Automated Script (Recommended)
```bash
# Make script executable
chmod +x scripts/deploy-to-server.sh

# Run deployment
./scripts/deploy-to-server.sh

# Or with parameters
./scripts/deploy-to-server.sh root 192.168.1.100 /root/thesun-next
```

### 2. Quick Deployment
```bash
./scripts/deploy-quick.sh root@192.168.1.100:/root/thesun-next
```

### 3. Manual Deployment
```bash
# Create directory on server
ssh root@server "mkdir -p /root/thesun-next"

# Sync files (exclude node_modules and .next)
rsync -avz --progress --exclude='node_modules' --exclude='.next' --exclude='.git' ./ root@server:/root/thesun-next/

# Setup on server
ssh root@server "
    cd /root/thesun-next
    npm install
    npm run build
    # Start application
    npm start
"
```

## Post-Deployment Setup

### 1. Environment Configuration
```bash
# Copy environment example
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Production Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start npm --name "thesun-next" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Systemd Service (Alternative)
Create `/etc/systemd/system/thesun-next.service`:
```ini
[Unit]
Description=TheSun Next.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/thesun-next
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable thesun-next
sudo systemctl start thesun-next
```

## Monitoring

### Check Application Status
```bash
# PM2
pm2 status
pm2 logs thesun-next

# Systemd
sudo systemctl status thesun-next
sudo journalctl -u thesun-next -f
```

### Check Port
```bash
# Default Next.js port is 3000
ss -tlnp | grep :3000
```

## Update Deployment

### 1. Using Script
```bash
./scripts/deploy-to-server.sh root 192.168.1.100 /root/thesun-next
```

### 2. Manual Update
```bash
# Pull latest changes (if using git)
ssh root@server "cd /root/thesun-next && git pull"

# Or sync changes
rsync -avz --progress --exclude='node_modules' --exclude='.next' ./ root@server:/root/thesun-next/

# Rebuild and restart
ssh root@server "
    cd /root/thesun-next
    npm install
    npm run build
    pm2 restart thesun-next
"
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

2. **Node.js version mismatch**
```bash
# Check Node.js version
node --version
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Build errors**
```bash
# Clear .next cache
rm -rf .next
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Logs Location
- PM2 logs: `~/.pm2/logs/thesun-next-out.log`
- PM2 error logs: `~/.pm2/logs/thesun-next-error.log`
- Systemd logs: `sudo journalctl -u thesun-next`

## Security Notes

1. **Do NOT commit .env file** to version control
2. Use strong passwords in production
3. Configure firewall to allow only necessary ports
4. Consider using reverse proxy (nginx/apache) for production
5. Enable HTTPS with SSL certificates

## Backup

### Backup Project
```bash
# Create backup archive
tar czf thesun-next-backup-$(date +%Y%m%d).tar.gz --exclude='node_modules' --exclude='.next' /root/thesun-next

# Restore from backup
tar xzf thesun-next-backup-20250304.tar.gz -C /root/
```

## Support
For issues, check:
1. Next.js documentation: https://nextjs.org/docs
2. PM2 documentation: https://pm2.keymetrics.io/docs/
3. Systemd documentation: https://www.freedesktop.org/wiki/Software/systemd/