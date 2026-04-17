#!/bin/bash

# Deployment script dengan password support
# Usage: ./scripts/deploy-with-password.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}=== TheSun Next.js Deployment ===${NC}"
echo ""

# Get server details
read -p "Server IP address: " SERVER_IP
read -p "Server username [root]: " SERVER_USER
SERVER_USER=${SERVER_USER:-root}
read -p "Destination path [/root/thesun-next]: " SERVER_PATH
SERVER_PATH=${SERVER_PATH:-/root/thesun-next}
read -sp "Server password: " SERVER_PASS
echo ""

LOCAL_PATH="$(pwd)"

echo -e "${GREEN}[1/5] Creating directory on server...${NC}"
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${SERVER_PATH}"

echo -e "${GREEN}[2/5] Syncing files to server...${NC}"
# Create temporary exclude file
EXCLUDE_FILE="/tmp/deploy-exclude-$$.txt"
cat > "$EXCLUDE_FILE" << EOF
node_modules
.next
.git
*.log
*.tmp
EOF

sshpass -p "$SERVER_PASS" rsync -avz \
    --progress \
    --exclude-from="$EXCLUDE_FILE" \
    -e "ssh -o StrictHostKeyChecking=no" \
    "${LOCAL_PATH}/" \
    "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

rm "$EXCLUDE_FILE"

echo -e "${GREEN}[3/5] Setting up project on server...${NC}"
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "bash -c '
    set -e
    cd ${SERVER_PATH}
    
    echo \"Checking Node.js...\"
    if ! command -v node &> /dev/null; then
        echo \"Installing Node.js 18...\"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo \"Node.js version: \$(node --version)\"
    
    echo \"Installing dependencies...\"
    npm install --production=false
    
    echo \"Building project...\"
    npm run build
    
    if [ ! -f .env ]; then
        echo \"Creating .env from example...\"
        cp .env.example .env 2>/dev/null || echo \".env.example not found\"
    fi
    
    echo \"Setup completed!\"
'"

echo -e "${GREEN}[4/5] Checking application...${NC}"
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "bash -c '
    cd ${SERVER_PATH}
    echo \"Project size: \$(du -sh . | cut -f1)\"
    echo \"Files count: \$(find . -type f | wc -l)\"
    echo \"Next.js build status: \$(ls -la .next/ 2>/dev/null | head -5 | wc -l) files in .next/\"
'"

echo -e "${GREEN}[5/5] Deployment Summary${NC}"
echo "================================="
echo "Server: ${SERVER_USER}@${SERVER_IP}"
echo "Path: ${SERVER_PATH}"
echo "Local: ${LOCAL_PATH}"
echo ""
echo -e "${GREEN}Next steps on server:${NC}"
echo "1. cd ${SERVER_PATH}"
echo "2. Check/edit .env file if needed"
echo "3. Start application: npm start"
echo "4. For production: install PM2 (npm install -g pm2)"
echo "5. PM2 command: pm2 start npm --name \"thesun-next\" -- start"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"