#!/bin/bash

# Script untuk deploy Next.js project ke server
# Author: Auto-generated
# Usage: ./scripts/deploy-to-server.sh [server_user] [server_ip] [server_path]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DEFAULT_USER="root"
DEFAULT_PATH="/root/thesun-next"
LOCAL_PATH="$(cd "$(dirname "$0")/.." && pwd)"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if SSH is available
    if ! command -v ssh &> /dev/null; then
        print_error "SSH client not found. Please install openssh-client."
        exit 1
    fi
    
    # Check if rsync is available
    if ! command -v rsync &> /dev/null; then
        print_warn "rsync not found. Using scp instead..."
        USE_SCP=true
    else
        USE_SCP=false
    fi
    
    # Check if tar is available
    if ! command -v tar &> /dev/null; then
        print_error "tar not found. Please install tar."
        exit 1
    fi
    
    # Check if local project exists
    if [ ! -f "${LOCAL_PATH}/package.json" ]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    print_info "Prerequisites check passed."
}

# Function to get user input
get_user_input() {
    if [ -z "$SERVER_USER" ]; then
        read -p "Enter server username [$DEFAULT_USER]: " input_user
        SERVER_USER=${input_user:-$DEFAULT_USER}
    fi
    
    if [ -z "$SERVER_IP" ]; then
        read -p "Enter server IP address: " SERVER_IP
        if [ -z "$SERVER_IP" ]; then
            print_error "Server IP is required."
            exit 1
        fi
    fi
    
    if [ -z "$SERVER_PATH" ]; then
        read -p "Enter server destination path [$DEFAULT_PATH]: " input_path
        SERVER_PATH=${input_path:-$DEFAULT_PATH}
    fi
}

# Function to deploy using rsync (preferred)
deploy_rsync() {
    print_info "Deploying using rsync..."
    
    # Create destination directory on server
    ssh "${SERVER_USER}@${SERVER_IP}" "bash -c 'mkdir -p ${SERVER_PATH}'"
    
    # Sync files excluding .git and node_modules (will install fresh on server)
    rsync -avz \
        --progress \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='*.log' \
        --exclude='*.tmp' \
        "${LOCAL_PATH}/" \
        "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
    
    print_info "Files synced successfully."
}

# Function to deploy using scp (fallback)
deploy_scp() {
    print_info "Deploying using scp..."
    
    # Create a temporary archive
    TEMP_ARCHIVE="/tmp/thesun-next-$(date +%Y%m%d%H%M%S).tar.gz"
    
    print_info "Creating archive..."
    tar --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.next' \
        -czf "${TEMP_ARCHIVE}" -C "${LOCAL_PATH}" .
    
    # Create destination directory on server
    ssh "${SERVER_USER}@${SERVER_IP}" "bash -c 'mkdir -p ${SERVER_PATH}'"
    
    # Copy archive to server
    print_info "Copying archive to server..."
    scp "${TEMP_ARCHIVE}" "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
    
    # Extract on server
    print_info "Extracting on server..."
    ssh "${SERVER_USER}@${SERVER_IP}" "bash -c '
        cd ${SERVER_PATH} && \
        tar xzf $(basename ${TEMP_ARCHIVE}) --strip-components=1 && \
        rm $(basename ${TEMP_ARCHIVE})
    '"
    
    # Clean up local archive
    rm "${TEMP_ARCHIVE}"
    
    print_info "Files deployed successfully."
}

# Function to setup project on server
setup_on_server() {
    print_info "Setting up project on server..."
    
    # Use bash explicitly to avoid fish shell issues
    ssh "${SERVER_USER}@${SERVER_IP}" "bash -c '
        set -e
        cd ${SERVER_PATH}
        
        echo \"Checking Node.js version...\"
        if ! command -v node &> /dev/null; then
            echo \"Node.js not found. Installing Node.js 18...\"
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        echo \"Node.js version:\"
        node --version
        
        echo \"Installing dependencies...\"
        npm install --production=false
        
        echo \"Building project...\"
        npm run build
        
        echo \"Checking if .env file exists...\"
        if [ ! -f .env ]; then
            echo \"Creating .env from example...\"
            cp .env.example .env 2>/dev/null || echo \".env.example not found\"
            echo \"Please update .env file with your configuration\"
        fi
        
        echo \"Setup completed successfully!\"
    '"
    
    print_info "Project setup completed on server."
}

# Function to show deployment summary
show_summary() {
    print_info "=== DEPLOYMENT SUMMARY ==="
    echo "Local Path:    ${LOCAL_PATH}"
    echo "Server:        ${SERVER_USER}@${SERVER_IP}"
    echo "Destination:   ${SERVER_PATH}"
    echo "Method:        $([ "$USE_SCP" = true ] && echo "SCP" || echo "Rsync")"
    echo ""
    print_info "Next steps on server:"
    echo "1. cd ${SERVER_PATH}"
    echo "2. Check .env configuration"
    echo "3. Start application: npm start"
    echo "4. For production: consider using PM2 or systemd"
}

# Main execution
main() {
    print_info "Starting deployment process..."
    
    # Parse command line arguments
    if [ $# -ge 1 ]; then
        SERVER_USER="$1"
    fi
    if [ $# -ge 2 ]; then
        SERVER_IP="$2"
    fi
    if [ $# -ge 3 ]; then
        SERVER_PATH="$3"
    fi
    if [ $# -ge 4 ]; then
        AUTO_CONFIRM="$4"
    fi
    
    check_prerequisites
    get_user_input
    
    print_info "Deploying to ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"
    
    # Auto-confirm for non-interactive mode
    if [ "$AUTO_CONFIRM" != "true" ]; then
        read -p "Continue with deployment? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Deployment cancelled."
            exit 0
        fi
    fi
    
    # Deploy files
    if [ "$USE_SCP" = true ]; then
        deploy_scp
    else
        deploy_rsync
    fi
    
    # Setup on server
    setup_on_server
    
    # Show summary
    show_summary
    
    print_info "Deployment completed successfully!"
}

# Run main function
main "$@"