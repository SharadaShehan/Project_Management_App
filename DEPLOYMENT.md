# Deployment Guide - Project Management App

Complete guide for deploying the serverless Project Management Application to AWS using CLI commands only.

## 📋 Prerequisites

Before deploying, ensure you have the following installed:

### Required Tools

1. **AWS CLI** (v2.x or higher)
   ```bash
   # Install on macOS
   brew install awscli
   
   # Install on Windows
   choco install awscli
   
   # Verify installation
   aws --version
   ```

2. **Terraform** (v1.5.0 or higher)
   ```bash
   # Install on macOS
   brew tap hashicorp/tap
   brew install hashicorp/tap/terraform
   
   # Install on Windows
   choco install terraform
   
   # Verify installation
   terraform --version
   ```

3. **Node.js** (v20.x or higher)
   ```bash
   # Install using nvm
   nvm install 20
   nvm use 20
   
   # Verify installation
   node --version
   npm --version
   ```

### AWS Configuration

Configure your AWS credentials:

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

Verify your configuration:
```bash
aws sts get-caller-identity
```

---

## 🚀 Quick Start Deployment

### Step 1: Clone and Navigate

```bash
cd Project_Management_App
```

### Step 2: Configure Terraform Variables

Copy the example configuration:
```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:
```hcl
aws_region      = "us-east-1"
project_name    = "project-mgmt-app"
environment     = "production"
gemini_api_key  = "YOUR_GOOGLE_GEMINI_API_KEY"
alert_email     = "your-email@example.com"
```

**Required Values:**
- `gemini_api_key`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `alert_email`: Email for CloudWatch alerts

### Step 3: Run Deployment Script

```bash
cd ..
chmod +x scripts/*.sh
./scripts/deploy.sh production
```

The script will:
1. ✓ Check prerequisites (AWS CLI, Terraform, Node.js)
2. ✓ Verify AWS credentials
3. ✓ Build Lambda functions and layer
4. ✓ Package all Lambda code
5. ✓ Initialize Terraform
6. ✓ Plan infrastructure changes
7. ✓ Deploy to AWS (after confirmation)
8. ✓ Generate frontend configuration

**Deployment Time:** ~5-10 minutes

---

## 📝 Step-by-Step Manual Deployment

If you prefer manual control or the script fails:

### 1. Build Lambda Functions

```bash
cd lambda

# Install dependencies
npm install

# Build Lambda layer (node_modules packaged for Lambda)
npm run build:layer

# Package Lambda functions
npm run build:functions

cd ..
```

**Output:**
- `lambda/layers/dependencies.zip` - Lambda layer
- `lambda/dist/lambda.zip` - Function code

### 2. Initialize Terraform Backend (First Time Only)

Create S3 bucket for Terraform state:

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REGION="us-east-1"

# Create S3 bucket
aws s3 mb s3://project-mgmt-terraform-state-${AWS_ACCOUNT_ID} --region ${REGION}

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket project-mgmt-terraform-state-${AWS_ACCOUNT_ID} \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ${REGION}
```

Update `infrastructure/backend.tf`:
```hcl
terraform {
  backend "s3" {
    bucket         = "project-mgmt-terraform-state-<YOUR_ACCOUNT_ID>"
    key            = "project-management/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}
```

### 3. Deploy Infrastructure

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan -out=tfplan

# Review the plan, then apply
terraform apply tfplan

cd ..
```

### 4. Generate Frontend Configuration

```bash
./scripts/generate-config.sh
```

This creates:
- `frontend/.env` - Environment variables
- `frontend/src/aws-config.js` - AWS Amplify config

### 5. Run Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔧 Configuration Options

### Environment-Specific Deployments

Deploy to different environments:

```bash
# Development
./scripts/deploy.sh development

# Staging
./scripts/deploy.sh staging

# Production
./scripts/deploy.sh production
```

Each environment gets isolated resources with name prefix: `project-mgmt-{environment}-*`

### Terraform Variables

Edit `infrastructure/terraform.tfvars`:

```hcl
# Required
aws_region      = "us-east-1"      # AWS region
project_name    = "project-mgmt"    # Resource name prefix
environment     = "production"      # Environment name
gemini_api_key  = "AIza..."         # Google Gemini API key
alert_email     = "ops@company.com" # CloudWatch alerts

# Optional (with defaults)
# dynamodb_billing_mode = "PAY_PER_REQUEST"
# lambda_memory_size    = 512
# lambda_timeout        = 30
```

---

## 🧪 Testing Deployment

After deployment, verify everything works:

```bash
./scripts/test-deployment.sh
```

This checks:
- ✓ AWS CLI configuration
- ✓ DynamoDB table exists
- ✓ Cognito User Pool exists
- ✓ AppSync API is accessible
- ✓ Lambda functions deployed (43 expected)
- ✓ S3 buckets created
- ✓ CloudWatch log groups
- ✓ SSM parameters
- ✓ Lambda layer version

### Manual Testing

**Test AppSync Endpoint:**
```bash
# Get endpoint
cd infrastructure
terraform output graphql_url

# Test with curl (requires JWT token)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"{ __typename }"}' \
  https://YOUR_APPSYNC_ENDPOINT/graphql
```

**List Lambda Functions:**
```bash
aws lambda list-functions \
  --query 'Functions[?starts_with(FunctionName, `project-mgmt-`)].FunctionName' \
  --output table
```

**Check DynamoDB Table:**
```bash
aws dynamodb describe-table \
  --table-name project-mgmt-production-table \
  --query 'Table.[TableName,TableStatus,ItemCount]' \
  --output table
```

---

## 📊 Deployment Outputs

After successful deployment, you'll receive:

```
AppSync GraphQL URL:     https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
Cognito User Pool ID:    us-east-1_XXXXXXXXX
Cognito App Client ID:   xxxxxxxxxxxxxxxxxxxx
Cognito Identity Pool:   us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DynamoDB Table:          project-mgmt-production-table
S3 Private Bucket:       project-mgmt-production-private-123456789012
S3 Public Bucket:        project-mgmt-production-public-123456789012
```

---

## 🔄 Updating Deployment

To update existing infrastructure:

```bash
# Make code changes to Lambda functions
cd lambda
# ... edit files ...

# Rebuild
npm run build

# Re-deploy (only changed resources updated)
cd ..
./scripts/deploy.sh production
```

Terraform will:
- Detect changes
- Show diff of what will change
- Update only modified resources
- Preserve data (DynamoDB, S3, Cognito users)

---

## 🗑️ Destroying Resources

**⚠️ WARNING: This permanently deletes ALL data!**

To destroy all AWS resources:

```bash
./scripts/destroy.sh
```

The script will:
1. Ask for confirmation (type `DELETE`)
2. Ask for environment name
3. Empty S3 buckets
4. Show destroy plan
5. Ask for final confirmation (type `YES`)
6. Destroy all Terraform-managed resources
7. Clean up local build artifacts

### Manual Destruction

```bash
cd infrastructure

# Empty S3 buckets first (required)
aws s3 rm s3://project-mgmt-production-private-ACCOUNT_ID --recursive
aws s3 rm s3://project-mgmt-production-public-ACCOUNT_ID --recursive

# Destroy infrastructure
terraform destroy

cd ..
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. AWS Credentials Not Found
```
Error: No valid credential sources found
```
**Solution:**
```bash
aws configure
# Or set environment variables
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"
```

#### 2. Terraform State Lock
```
Error: Error locking state: ConditionalCheckFailedException
```
**Solution:**
```bash
# List locks
aws dynamodb scan --table-name terraform-state-locks

# Force unlock (use Lock ID from error)
terraform force-unlock LOCK_ID
```

#### 3. Lambda Package Too Large
```
Error: InvalidParameterValueException: Unzipped size must be smaller than...
```
**Solution:**
```bash
# Rebuild without unnecessary files
cd lambda
npm run clean
npm run build
```

#### 4. S3 Bucket Already Exists
```
Error: BucketAlreadyExists: The requested bucket name is not available
```
**Solution:** S3 bucket names are globally unique. Edit `terraform.tfvars`:
```hcl
project_name = "project-mgmt-yourcompany"  # Make it unique
```

#### 5. Insufficient Permissions
```
Error: AccessDenied: User: arn:aws:iam::...
```
**Solution:** Ensure your IAM user/role has permissions:
- DynamoDB: Full access
- Lambda: Full access
- S3: Full access
- Cognito: Full access
- AppSync: Full access
- IAM: Create/manage roles
- CloudWatch: Create log groups
- SSM: Parameter Store access

#### 6. Terraform Output Not Found
```
Error: Output "graphql_url" not found
```
**Solution:**
```bash
cd infrastructure
terraform refresh
terraform output
```

### Getting Help

**View Logs:**
```bash
# Lambda function logs
aws logs tail /aws/lambda/project-mgmt-user-login --follow

# All Lambda logs
aws logs tail --follow --filter-pattern "project-mgmt"
```

**Check Resources:**
```bash
# All resources with tag
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=project-mgmt-app \
  --query 'ResourceTagMappingList[].ResourceARN' \
  --output table
```

**Terraform State:**
```bash
cd infrastructure
terraform state list
terraform state show aws_appsync_graphql_api.main
```

---

## 💰 Cost Estimation

### Free Tier (First 12 months)
- Lambda: 1M requests/month
- DynamoDB: 25 GB storage, 25 WCU, 25 RCU
- S3: 5 GB storage, 20k GET requests
- Cognito: 50k MAU

### Estimated Monthly Cost (Beyond Free Tier)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 5M invocations, 512MB | $25 |
| DynamoDB | On-demand, 1M reads, 500k writes | $15 |
| AppSync | 10M requests | $40 |
| S3 | 100 GB storage, 1M requests | $25 |
| Cognito | 1,000 MAU | $5 |
| CloudWatch | Logs + Metrics | $10 |
| **Total** | | **~$120/month** |

For low traffic: **$5-20/month**

---

## 🎯 Next Steps After Deployment

1. **Create Test Users**
   ```bash
   # Via AWS Console or CLI
   aws cognito-idp admin-create-user \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username testuser \
     --user-attributes Name=email,Value=test@example.com \
     --temporary-password TempPass123!
   ```

2. **Test GraphQL API**
   - Open AWS Console → AppSync
   - Go to Queries tab
   - Test with authenticated user

3. **Monitor Resources**
   - CloudWatch Dashboard
   - Lambda metrics
   - DynamoDB capacity

4. **Set Up CI/CD** (optional)
   - AWS CodePipeline
   - GitLab CI
   - Jenkins

5. **Configure Monitoring**
   - CloudWatch alarms
   - SNS notifications
   - X-Ray tracing

---

## 📚 Additional Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Single-Table Design](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/)
- [Google Gemini API](https://ai.google.dev/docs)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review CloudWatch logs
3. Verify Terraform state
4. Open GitHub issue

---

**Last Updated:** December 2025  
**Version:** 1.0.0
