#!/bin/bash
set -e

# Define directories
FRONTEND_DIR="./frontend"
INFRA_DIR="./infra"

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to echo with timestamp and color
log() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] $message${NC}"
}

# Install frontend dependencies
log "$YELLOW" "Installing frontend dependencies"
(cd "$FRONTEND_DIR" && npm install)

log "$YELLOW" "Installing frontend scripts dependencies"
(cd "$FRONTEND_DIR/scripts" && npm install)

# Install infra dependencies
log "$YELLOW" "Installing infra dependencies"
(cd "$INFRA_DIR" && npm install)

log "$GREEN" "All dependencies installed successfully"
