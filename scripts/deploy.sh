#!/bin/bash

# Complete Deployment Script for Project Management App
# This script deploys the entire serverless infrastructure

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Project Management App - AWS Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Upload Lambda layer to S3 (if using remote deployment)
echo ""
echo "☁️  Preparing Lambda deployment..."
LAMBDA_BUCKET="project-mgmt-lambda-deploy-${AWS_ACCOUNT}"

# Check if bucket exists, create if not
if ! aws s3 ls "s3://${LAMBDA_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    print_status "Using existing S3 bucket: ${LAMBDA_BUCKET}"
else
    print_status "Creating S3 bucket: ${LAMBDA_BUCKET}"
    aws s3 mb "s3://${LAMBDA_BUCKET}" --region "${AWS_REGION}"
fi

# Upload Lambda artifacts
print_status "Uploading Lambda layer..."
aws s3 cp lambda/layers/dependencies.zip "s3://${LAMBDA_BUCKET}/lambda-layer.zip"

print_status "Uploading Lambda functions..."
aws s3 cp lambda/dist/lambda.zip "s3://${LAMBDA_BUCKET}/lambda-functions.zip"

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

# Plan deployment
echo ""
echo "📊 Terraform plan:"
terraform plan -out=tfplan

# Ask for confirmation
echo ""
read -p "Do you want to apply this plan? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    print_warning "Deployment cancelled"
    exit 0
fi

# Apply Terraform
print_status "Applying Terraform configuration..."
terraform apply tfplan

cd ..
print_status "Infrastructure deployed successfully"

# Generate frontend configuration
echo ""
echo "⚙️  Generating frontend configuration..."
chmod +x scripts/generate-config.sh
./scripts/generate-config.sh

# Display next steps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 To run the frontend:"
echo "   cd frontend"
echo "   npm install  # Install AWS Amplify dependencies"
echo "   npm start"
echo ""
echo "🔧 Useful commands:"
echo "   - View AppSync API: aws appsync list-graphql-apis"
echo "   - View Cognito pools: aws cognito-idp list-user-pools --max-results 10"
echo "   - View Lambda functions: aws lambda list-functions"
echo "   - View CloudWatch logs: aws logs tail /aws/lambda/<function-name> --follow"
echo ""
echo "📚 Resources created:"
echo "   - DynamoDB table"
echo "   - Cognito User Pool & Identity Pool"
echo "   - AppSync GraphQL API (43 resolvers)"
echo "   - 43 Lambda functions"
echo "   - S3 buckets (private & public)"
echo "   - CloudWatch logs & monitoring"
echo ""
echo "🔐 Important: Set the Gemini API key in Parameter Store:"
echo "   aws ssm put-parameter --name '/project-management/gemini-api-key' \\"
echo "       --value 'your-gemini-api-key' \\"
echo "       --type 'SecureString' \\"
echo "       --overwrite"
echo ""
