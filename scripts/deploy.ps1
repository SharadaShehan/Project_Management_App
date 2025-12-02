# Deploy Script for Windows (PowerShell)
# Complete Deployment Script for Project Management App
# Usage: .\scripts\deploy.ps1 [environment]
# Example: .\scripts\deploy.ps1 production

param(
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Project Management App - AWS Deployment" -ForegroundColor Green
Write-Host "   Environment: $Environment" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check Terraform
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Terraform is not installed" -ForegroundColor Red
    Write-Host "  Install from: https://www.terraform.io/downloads" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Terraform installed" -ForegroundColor Green

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "✗ AWS CLI is not installed" -ForegroundColor Red
    Write-Host "  Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ AWS CLI installed" -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Node.js is not installed" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js installed" -ForegroundColor Green

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "✗ npm is not installed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm installed" -ForegroundColor Green

# Check AWS credentials
Write-Host ""
Write-Host "🔐 Checking AWS credentials..." -ForegroundColor Cyan
try {
    $awsAccount = (aws sts get-caller-identity --query Account --output text)
    $awsRegion = (aws configure get region)
    if (-not $awsRegion) { $awsRegion = "us-east-1" }
    Write-Host "✓ AWS credentials configured (Account: $awsAccount, Region: $awsRegion)" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS credentials not configured" -ForegroundColor Red
    Write-Host "  Run: aws configure" -ForegroundColor Yellow
    exit 1
}

# Build Lambda functions
Write-Host ""
Write-Host "📦 Building Lambda functions..." -ForegroundColor Cyan
Set-Location lambda

if (-not (Test-Path "package.json")) {
    Write-Host "✗ package.json not found in lambda directory" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Installing Lambda dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✓ Building Lambda layer..." -ForegroundColor Yellow
npm run build:layer

Write-Host "✓ Packaging Lambda functions..." -ForegroundColor Yellow
npm run build:functions

Set-Location ..
Write-Host "✓ Lambda functions built successfully" -ForegroundColor Green

# Verify Lambda artifacts
Write-Host ""
Write-Host "☁️  Verifying Lambda artifacts..." -ForegroundColor Cyan

if (-not (Test-Path "lambda/layers/dependencies.zip")) {
    Write-Host "✗ Lambda layer not found. Build may have failed." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "lambda/dist/lambda.zip")) {
    Write-Host "✗ Lambda functions package not found. Build may have failed." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Lambda artifacts verified" -ForegroundColor Green

# Deploy Terraform infrastructure
Write-Host ""
Write-Host "🏗️  Deploying Terraform infrastructure..." -ForegroundColor Cyan
Set-Location infrastructure

# Check if terraform.tfvars exists
if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "⚠ terraform.tfvars not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path "terraform.tfvars.example") {
        Copy-Item "terraform.tfvars.example" "terraform.tfvars"
        Write-Host "ℹ Please edit infrastructure/terraform.tfvars with your configuration" -ForegroundColor Blue
        Write-Host "  Required: gemini_api_key, alert_email" -ForegroundColor Blue
        Read-Host "Press Enter after updating terraform.tfvars"
    } else {
        Write-Host "✗ terraform.tfvars.example not found" -ForegroundColor Red
        exit 1
    }
}

# Initialize Terraform
Write-Host "✓ Initializing Terraform..." -ForegroundColor Yellow
terraform init

# Format Terraform files
Write-Host "✓ Formatting Terraform files..." -ForegroundColor Yellow
terraform fmt -recursive

# Validate Terraform configuration
Write-Host "✓ Validating Terraform configuration..." -ForegroundColor Yellow
terraform validate

# Plan deployment
Write-Host ""
Write-Host "📊 Generating Terraform plan..." -ForegroundColor Cyan
terraform plan -var="environment=$Environment" -out=tfplan

# Ask for confirmation
Write-Host ""
$confirm = Read-Host "Do you want to apply this plan? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "⚠ Deployment cancelled by user" -ForegroundColor Yellow
    if (Test-Path "tfplan") { Remove-Item "tfplan" }
    exit 0
}

# Apply Terraform
Write-Host "✓ Applying Terraform configuration..." -ForegroundColor Yellow
terraform apply -auto-approve tfplan
if (Test-Path "tfplan") { Remove-Item "tfplan" }

# Get deployment outputs
Write-Host ""
Write-Host "📋 Retrieving deployment information..." -ForegroundColor Cyan
$appsyncEndpoint = (terraform output -raw graphql_url 2>$null)
$cognitoUserPool = (terraform output -raw cognito_user_pool_id 2>$null)
$cognitoClientId = (terraform output -raw cognito_app_client_id 2>$null)

Set-Location ..
Write-Host "✓ Infrastructure deployed successfully" -ForegroundColor Green

# Generate frontend configuration
Write-Host ""
Write-Host "⚙️  Generating frontend configuration..." -ForegroundColor Cyan
& .\scripts\generate-config.ps1

# Display next steps
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Deployment Summary:" -ForegroundColor Yellow
Write-Host "   Environment:     $Environment"
Write-Host "   AWS Region:      $awsRegion"
Write-Host "   AWS Account:     $awsAccount"
Write-Host "   AppSync URL:     $appsyncEndpoint"
Write-Host "   User Pool ID:    $cognitoUserPool"
Write-Host ""
Write-Host "📱 Next Steps - Frontend Setup:" -ForegroundColor Green
Write-Host "   1. cd frontend"
Write-Host "   2. npm install"
Write-Host "   3. npm start"
Write-Host ""
Write-Host "🔧 Useful AWS CLI Commands:" -ForegroundColor Cyan
Write-Host "   • List Lambda functions:    aws lambda list-functions --query 'Functions[?starts_with(FunctionName, ``project-mgmt-``)].FunctionName'"
Write-Host "   • View AppSync APIs:        aws appsync list-graphql-apis"
Write-Host "   • Check CloudWatch logs:    aws logs tail /aws/lambda/project-mgmt-user-login --follow"
Write-Host ""
Write-Host "📚 Deployed AWS Resources:" -ForegroundColor Yellow
Write-Host "   ✓ DynamoDB Table (with 3 GSIs)"
Write-Host "   ✓ Cognito User Pool & App Client"
Write-Host "   ✓ AppSync GraphQL API"
Write-Host "   ✓ 43 Lambda Functions"
Write-Host "   ✓ Lambda Layer (dependencies)"
Write-Host "   ✓ S3 Buckets (private & public)"
Write-Host "   ✓ IAM Roles & Policies"
Write-Host "   ✓ CloudWatch Logs & Alarms"
Write-Host "   ✓ SSM Parameters"
Write-Host ""
Write-Host "🧪 To test the deployment:" -ForegroundColor Cyan
Write-Host "   .\scripts\test-deployment.ps1"
Write-Host ""
Write-Host "🗑️  To destroy all resources:" -ForegroundColor Red
Write-Host "   .\scripts\destroy.ps1"
Write-Host ""
