#!/bin/bash

# Destroy Script for Project Management App
# This script removes all AWS resources created by Terraform
# WARNING: This is destructive and cannot be undone!

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Project Management App - Resource Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

# Warning
echo -e "${RED}⚠️  WARNING: This will permanently delete all resources!${NC}"
echo ""
echo "This will destroy:"
echo "  • DynamoDB tables and ALL data"
echo "  • Lambda functions"
echo "  • AppSync API"
echo "  • Cognito User Pools and ALL users"
echo "  • S3 buckets (after emptying)"
echo "  • CloudWatch logs"
echo "  • All other infrastructure"
echo ""
read -p "Are you ABSOLUTELY sure you want to proceed? (type 'DELETE' to confirm): " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    print_warning "Destruction cancelled"
    exit 0
fi

echo ""
read -p "Type the environment name to confirm (e.g., development, production): " ENV_CONFIRM

if [ -z "$ENV_CONFIRM" ]; then
    print_error "Environment name required"
    exit 1
fi

# Get AWS info
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
AWS_REGION=$(aws configure get region || echo "us-east-1")

if [ -z "$AWS_ACCOUNT" ]; then
    print_error "Could not get AWS account ID. Check your AWS credentials."
    exit 1
fi

print_status "AWS Account: ${AWS_ACCOUNT}"
print_status "AWS Region: ${AWS_REGION}"

echo ""
echo "🗑️  Starting resource cleanup..."

# Empty S3 buckets before Terraform destroy
echo ""
echo "📦 Emptying S3 buckets..."

PRIVATE_BUCKET="project-mgmt-${ENV_CONFIRM}-private-${AWS_ACCOUNT}"
PUBLIC_BUCKET="project-mgmt-${ENV_CONFIRM}-public-${AWS_ACCOUNT}"

# Check and empty private bucket
if aws s3 ls "s3://${PRIVATE_BUCKET}" &>/dev/null; then
    print_status "Emptying private bucket: ${PRIVATE_BUCKET}"
    aws s3 rm "s3://${PRIVATE_BUCKET}" --recursive
else
    print_warning "Private bucket not found or already deleted"
fi

# Check and empty public bucket
if aws s3 ls "s3://${PUBLIC_BUCKET}" &>/dev/null; then
    print_status "Emptying public bucket: ${PUBLIC_BUCKET}"
    aws s3 rm "s3://${PUBLIC_BUCKET}" --recursive
else
    print_warning "Public bucket not found or already deleted"
fi

# Run Terraform destroy
echo ""
echo "🔨 Running Terraform destroy..."
cd infrastructure

if [ ! -f "terraform.tfstate" ]; then
    print_warning "No Terraform state found. Resources may have already been destroyed."
    echo ""
    read -p "Do you want to try destroying anyway? (yes/no): " TRY_ANYWAY
    if [ "$TRY_ANYWAY" != "yes" ]; then
        exit 0
    fi
fi

terraform init

print_status "Generating destroy plan..."
terraform plan -destroy -var="environment=${ENV_CONFIRM}" -out=destroy.tfplan

echo ""
print_warning "Review the plan above. This is your last chance to abort!"
read -p "Type 'YES' to proceed with destruction: " FINAL_CONFIRM

if [ "$FINAL_CONFIRM" != "YES" ]; then
    print_warning "Destruction cancelled"
    rm -f destroy.tfplan
    exit 0
fi

terraform apply destroy.tfplan
rm -f destroy.tfplan

cd ..

# Clean up build artifacts
echo ""
echo "🧹 Cleaning up local build artifacts..."
if [ -d "lambda/dist" ]; then
    rm -rf lambda/dist
    print_status "Removed lambda/dist"
fi

if [ -d "lambda/layers" ]; then
    rm -rf lambda/layers
    print_status "Removed lambda/layers"
fi

if [ -d "lambda/node_modules" ]; then
    rm -rf lambda/node_modules
    print_status "Removed lambda/node_modules"
fi

# Clean up generated config files
if [ -f "frontend/.env" ]; then
    rm -f frontend/.env
    print_status "Removed frontend/.env"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "All AWS resources have been destroyed."
echo ""
echo "Note: Some resources may take a few minutes to fully delete:"
echo "  • CloudWatch log groups (retention period)"
echo "  • S3 buckets (if versioning was enabled)"
echo "  • DynamoDB backups (if point-in-time recovery was enabled)"
echo ""
echo "To verify all resources are deleted:"
echo "  aws resourcegroupstaggingapi get-resources --tag-filters Key=Project,Values=project-mgmt"
echo ""
