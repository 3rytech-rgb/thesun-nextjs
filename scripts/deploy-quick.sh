#!/bin/bash

# Quick deployment script - simple version
# Usage: ./scripts/deploy-quick.sh user@server:/path

set -e

LOCAL_PATH="$(pwd)"
REMOTE="$1"

if [ -z "$REMOTE" ]; then
    echo "Usage: $0 user@server:/path"
    echo "Example: $0 root@192.168.1.100:/root/thesun-next"
    exit 1
fi

echo "Deploying to: $REMOTE"

# Extract user, server and path
SERVER_USER=$(echo "$REMOTE" | cut -d@ -f1)
SERVER_HOST=$(echo "$REMOTE" | cut -d@ -f2 | cut -d: -f1)
SERVER_PATH=$(echo "$REMOTE" | cut -d: -f2)

echo "Creating directory on server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${SERVER_PATH}"

echo "Syncing files (excluding node_modules and .next)..."
rsync -avz \
    --progress \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    "${LOCAL_PATH}/" \
    "${REMOTE}/"

echo "Installing dependencies and building on server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "
    cd ${SERVER_PATH}
    npm install --production=false
    npm run build
    echo 'Deployment completed!'
    echo 'Run: cd ${SERVER_PATH} && npm start'
"

echo "Quick deployment completed!"