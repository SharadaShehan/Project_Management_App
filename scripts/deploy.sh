#!/bin/bash

# Complete Deployment Script for Project Management App
# This script deploys the entire serverless infrastructure
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e

# Get environment from argument or default to development
ENVIRONMENT=${1:-development}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Project Management App - AWS Deployment"
echo "   Environment: $ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed"
    exit 1
fi
print_status "Terraform installed"

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    exit 1
fi
print_status "AWS CLI installed"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js installed"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm installed"

# Check AWS credentials
echo ""
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured"
    echo "   Run: aws configure"
    exit 1
fi
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")
print_status "AWS credentials configured (Account: $AWS_ACCOUNT, Region: $AWS_REGION)"

# Build Lambda functions
echo ""
echo "📦 Building Lambda functions..."
cd lambda

if [ ! -f "package.json" ]; then
    print_error "package.json not found in lambda directory"
    exit 1
fi

print_status "Installing Lambda dependencies..."
npm install

print_status "Building Lambda layer..."
npm run build:layer

print_status "Packaging Lambda functions..."
npm run build:functions

cd ..
print_status "Lambda functions built successfully"

# Verify Lambda artifacts exist
echo ""
echo "☁️  Verifying Lambda artifacts..."

if [ ! -f "lambda/layers/dependencies.zip" ]; then
    print_error "Lambda layer not found. Build may have failed."
    exit 1
fi

if [ ! -f "lambda/dist/lambda.zip" ]; then
    print_error "Lambda functions package not found. Build may have failed."
    exit 1
fi

print_status "Lambda artifacts verified"

# Deploy Terraform infrastructure
echo ""
echo "🏗️  Deploying Terraform infrastructure..."
cd infrastructure

# Initialize Terraform
print_status "Initializing Terraform..."
terraform init

# Format Terraform files
print_status "Formatting Terraform files..."
terraform fmt -recursive

# Validate Terraform configuration
print_status "Validating Terraform configuration..."
terraform validate

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    print_warning "terraform.tfvars not found. Creating from example..."
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        print_info "Please edit infrastructure/terraform.tfvars with your configuration"
        print_info "Required: gemini_api_key, alert_email"
        read -p "Press Enter after updating terraform.tfvars..."
    else
        print_error "terraform.tfvars.example not found"
        exit 1
    fi
fi

# Plan deployment
echo ""
echo "📊 Generating Terraform plan..."
terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan

# Ask for confirmation
echo ""
read -p "Do you want to apply this plan? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    print_warning "Deployment cancelled by user"
    rm -f tfplan
    exit 0
fi

# Apply Terraform
print_status "Applying Terraform configuration..."
terraform apply -auto-approve tfplan
rm -f tfplan

cd ..
print_status "Infrastructure deployed successfully"

# Generate frontend configuration
echo ""
echo "⚙️  Generating frontend configuration..."
chmod +x scripts/generate-config.sh
./scripts/generate-config.sh

# Get deployment outputs
echo ""
echo "📋 Retrieving deployment information..."
cd infrastructure
APPSYNC_ENDPOINT=$(terraform output -raw graphql_url 2>/dev/null || echo "Not available")
COGNITO_USER_POOL=$(terraform output -raw cognito_user_pool_id 2>/dev/null || echo "Not available")
COGNITO_CLIENT_ID=$(terraform output -raw cognito_app_client_id 2>/dev/null || echo "Not available")
cd ..

# Display next steps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Deployment Summary:"
echo "   Environment:     ${ENVIRONMENT}"
echo "   AWS Region:      ${AWS_REGION}"
echo "   AWS Account:     ${AWS_ACCOUNT}"
echo "   AppSync URL:     ${APPSYNC_ENDPOINT}"
echo "   User Pool ID:    ${COGNITO_USER_POOL}"
echo ""
echo "📱 Next Steps - Frontend Setup:"
echo "   1. cd frontend"
echo "   2. npm install"
echo "   3. npm start"
echo ""
echo "🔧 Useful AWS CLI Commands:"
echo "   • View all resources:       aws resourcegroupstaggingapi get-resources"
echo "   • List Lambda functions:    aws lambda list-functions --query 'Functions[?starts_with(FunctionName, \`project-mgmt-\`)].FunctionName'"
echo "   • View AppSync APIs:        aws appsync list-graphql-apis"
echo "   • Check CloudWatch logs:    aws logs tail /aws/lambda/project-mgmt-user-login --follow"
echo "   • Test DynamoDB:            aws dynamodb list-tables"
echo ""
echo "📚 Deployed AWS Resources:"
echo "   ✓ DynamoDB Table (with 3 GSIs)"
echo "   ✓ Cognito User Pool & App Client"
echo "   ✓ AppSync GraphQL API"
echo "   ✓ 43 Lambda Functions"
echo "   ✓ Lambda Layer (dependencies)"
echo "   ✓ S3 Buckets (private & public)"
echo "   ✓ IAM Roles & Policies"
echo "   ✓ CloudWatch Logs & Alarms"
echo "   ✓ SSM Parameters"
echo ""
echo "🧪 To test the deployment:"
echo "   ./scripts/test-deployment.sh"
echo ""
echo "🗑️  To destroy all resources:"
echo "   ./scripts/destroy.sh"
echo ""
