#!/bin/bash

# Simple deployment script
# Run: ./scripts/deploy-simple.sh

echo "=== Deploy TheSun Next.js to Server ==="
echo ""

# Configuration - EDIT THESE!
SERVER_IP="190.254.2.223"
SERVER_USER="root"
SERVER_PATH="/root/thesun-next"
SERVER_PASS="Thesun123"  # GANTI DENGAN PASSWORD SERVER ANDA

LOCAL_PATH="$(cd "$(dirname "$0")/.." && pwd)"

echo "Deploying to: $SERVER_USER@$SERVER_IP:$SERVER_PATH"
echo "Local path: $LOCAL_PATH"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Step 1: Create directory
echo "[1/5] Creating directory..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

# Step 2: Sync files
echo "[2/5] Syncing files..."
sshpass -p "$SERVER_PASS" rsync -avz \
    --progress \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -e "ssh -o StrictHostKeyChecking=no" \
    "$LOCAL_PATH/" \
    "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

# Step 3: Setup on server
echo "[3/5] Setting up on server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "bash -c '
    cd $SERVER_PATH
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo \"Installing Node.js 18...\"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo \"Node.js: \$(node --version)\"
    
    # Install dependencies
    npm install
    
    # Build project
    npm run build
    
    # Setup .env if needed
    if [ ! -f .env ] && [ -f .env.example ]; then
        cp .env.example .env
        echo \"Created .env from example\"
    fi
    
    echo \"Setup completed!\"
'"

# Step 4: Verify
echo "[4/5] Verifying deployment..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "bash -c '
    cd $SERVER_PATH
    echo \"✓ Directory: \$(pwd)\"
    echo \"✓ Files: \$(find . -type f | wc -l) files\"
    echo \"✓ Package.json: \$(cat package.json | grep name)\"
    ls -la .next/ 2>/dev/null && echo \"✓ Build folder exists\" || echo \"✗ No build folder\"
'"

# Step 5: Instructions
echo "[5/5] Deployment Complete!"
echo ""
echo "=== NEXT STEPS ==="
echo "1. SSH to server: ssh $SERVER_USER@$SERVER_IP"
echo "2. Go to project: cd $SERVER_PATH"
echo "3. Check .env: nano .env (edit if needed)"
echo "4. Start app: npm start"
echo "5. For production:"
echo "   npm install -g pm2"
echo "   pm2 start npm --name \"thesun\" -- start"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "App will run on: http://$SERVER_IP:3000"
