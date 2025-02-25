#!/bin/bash
set -e

# Define directories
INFRA_DIR="./infra"
FRONTEND_DIR="./frontend"

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

# Deploy infra
log "$GREEN" "Bootstrapping CDK"
(cd "$INFRA_DIR" && cdk bootstrap)

log "$GREEN" "Deploying infra components"
(cd "$INFRA_DIR" && cdk deploy AppSyncDemoBackendStack)

# Generate frontend configurations
log "$YELLOW" "Populating frontend configurations from deployed resources"
(cd "$FRONTEND_DIR/scripts" && npx ts-node ./generate-aws-exports.ts)

# Build UI
log "$YELLOW" "Building UI"
(cd "$FRONTEND_DIR" && npm run build)


# Deploy UI resources
log "$GREEN" "Deploying UI Resources"
(cd "$INFRA_DIR" && cdk deploy AppSyncDemoUiStack)

log "$GREEN" "Deployment completed successfully"
