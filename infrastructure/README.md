# Infrastructure - Terraform Configuration

This directory contains Terraform Infrastructure-as-Code (IaC) for deploying the Project Management App to AWS using serverless architecture.

## Architecture Overview

### AWS Services Used
- **AWS AppSync**: GraphQL API with real-time subscriptions
- **Amazon DynamoDB**: NoSQL database (single-table design)
- **Amazon Cognito**: User authentication and authorization
- **AWS Lambda**: Serverless compute (43 functions)
- **Amazon S3**: Object storage for images (private + public buckets)
- **AWS Systems Manager Parameter Store**: Secure configuration management
- **Amazon CloudWatch**: Logging, monitoring, and alerting
- **AWS IAM**: Identity and access management

### Module Structure

```
infrastructure/
├── main.tf                    # Root configuration orchestrating all modules
├── backend.tf                 # Terraform remote state configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example configuration
└── modules/
    ├── dynamodb/              # DynamoDB table with GSIs
    ├── cognito/               # User Pool and App Client
    ├── s3/                    # Private and public buckets
    ├── iam/                   # IAM roles and policies
    ├── parameters/            # SSM Parameter Store
    ├── lambda/                # Lambda functions (43 total)
    ├── appsync/               # GraphQL API and schema
    └── monitoring/            # CloudWatch logs, alarms, dashboard
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** >= 1.5.0 ([Install](https://developer.hashicorp.com/terraform/downloads))
3. **AWS CLI** configured with credentials ([Setup](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
4. **Node.js** 20.x for Lambda function packaging
5. **Google Gemini API Key** for AI-powered forum answers

## Setup Instructions

### 1. Prepare Backend State Storage

Create S3 bucket and DynamoDB table for Terraform remote state:

```bash
# Set your desired bucket name (must be globally unique)
export TF_STATE_BUCKET="your-project-terraform-state"
export TF_STATE_TABLE="terraform-state-locks"
export AWS_REGION="us-east-1"

# Create S3 bucket
aws s3 mb s3://${TF_STATE_BUCKET} --region ${AWS_REGION}

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ${TF_STATE_BUCKET} \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name ${TF_STATE_TABLE} \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ${AWS_REGION}
```

### 2. Update Backend Configuration

Edit `backend.tf` with your bucket name:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-project-terraform-state"  # Change this
    key            = "project-management/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}
```

### 3. Configure Variables

Copy the example configuration:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region      = "us-east-1"
project_name    = "project-mgmt-app"
environment     = "prod"
gemini_api_key  = "your-gemini-api-key-here"
alert_email     = "your-email@example.com"
```

### 4. Package Lambda Functions

Before deploying, Lambda functions must be packaged:

```bash
cd ../lambda

# Install dependencies
npm install

# Build Lambda layer with dependencies
mkdir -p layers/nodejs
npm install --prefix layers/nodejs aws-sdk uuid @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @google-cloud/genai

# Create layer zip
cd layers && zip -r dependencies.zip nodejs && cd ..

# Package Lambda functions
mkdir -p dist
zip -r dist/lambda.zip . -x "node_modules/*" "layers/*" "dist/*" "*.md"

cd ../infrastructure
```

### 5. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Review execution plan
terraform plan

# Apply changes
terraform apply
```

Review the plan carefully and type `yes` to confirm deployment.

### 6. Retrieve Outputs

After successful deployment:

```bash
# View all outputs
terraform output

# Get specific values
terraform output graphql_url
terraform output cognito_user_pool_id
terraform output cognito_app_client_id
```

## Lambda Functions

The infrastructure deploys **43 Lambda functions**:

### User Functions (4)
- `user-signup`: Register new users
- `user-login`: Authenticate users
- `user-update-profile`: Update user profile
- `user-get-profile`: Get user details

### Project Functions (7)
- `project-create`: Create new project
- `project-get`: Get project details
- `project-update`: Update project
- `project-delete`: Delete project
- `project-list`: List user's projects
- `project-invite-user`: Invite users to project
- `project-get-members`: Get project members

### Process Functions (5)
- `process-create`: Create process
- `process-get`: Get process
- `process-update`: Update process
- `process-delete`: Delete process
- `process-list`: List processes

### Phase Functions (5)
- `phase-create`: Create phase
- `phase-get`: Get phase
- `phase-update`: Update phase
- `phase-delete`: Delete phase
- `phase-list`: List phases

### Task Functions (6)
- `task-create`: Create task
- `task-get`: Get task
- `task-update`: Update task
- `task-delete`: Delete task
- `task-list`: List tasks
- `task-update-status`: Update task status

### Forum Functions (6)
- `forum-create-post`: Create forum post
- `forum-get-post`: Get post details
- `forum-update-post`: Update post
- `forum-delete-post`: Delete post
- `forum-list-posts`: List posts
- `forum-generate-ai-answer`: Generate AI answer with Gemini

### Message Functions (4)
- `message-send`: Send message
- `message-list-private`: List private messages
- `message-list-project`: List project messages
- `message-list-phase`: List phase messages

### Request Functions (4)
- `request-create`: Create request
- `request-list`: List requests
- `request-accept`: Accept request
- `request-decline`: Decline request

### Cognito Triggers (2)
- `cognito-pre-signup`: Pre-signup validation
- `cognito-post-confirmation`: Sync user to DynamoDB

### Utility Functions (1)
- `image-generate-presigned-url`: Generate S3 presigned URLs

## DynamoDB Schema

Single-table design with the following structure:

### Primary Key
- **PK**: Partition key (e.g., `USER#<userId>`, `PROJECT#<projectId>`)
- **SK**: Sort key (e.g., `METADATA`, `MEMBER#<userId>`)

### Global Secondary Indexes

#### GSI1 - Username Lookup
- **GSI1PK**: `USERNAME#<username>`
- **GSI1SK**: `METADATA`

#### GSI2 - Status/Type Queries
- **GSI2PK**: Entity type (e.g., `TASK`, `POST`)
- **GSI2SK**: Status or timestamp

#### GSI3 - Timeline/Chronological
- **GSI3PK**: Entity type
- **GSI3SK**: Timestamp (ISO string)

## Monitoring

### CloudWatch Alarms
- DynamoDB read/write throttles
- Lambda function errors
- AppSync 4XX/5XX errors

### Dashboard
Access CloudWatch dashboard: `<project-name>-<environment>-dashboard`

### SNS Alerts
Critical alarms sent to configured email address.

## Cost Estimation

### Monthly Costs (approximate, low traffic)
- **DynamoDB**: $0-5 (on-demand pricing)
- **Lambda**: $0-10 (1M requests free tier)
- **AppSync**: $0-5 (250k queries free tier)
- **Cognito**: $0 (50k MAU free tier)
- **S3**: $0-2 (storage + requests)
- **CloudWatch**: $0-3 (logs + metrics)

**Total**: ~$5-25/month for development/staging

## Security Best Practices

✅ **Implemented**:
- Cognito JWT authentication for all API requests
- IAM roles with least-privilege permissions
- S3 bucket encryption (AES256)
- Secure parameter store for API keys (SecureString)
- VPC endpoints (optional, can be added)
- DynamoDB point-in-time recovery

## Cleanup

To destroy all resources:

```bash
# WARNING: This will delete ALL resources including data
terraform destroy
```

Confirm by typing `yes`.

## Troubleshooting

### Issue: Terraform state locked
```bash
# Force unlock (use carefully)
terraform force-unlock <LOCK_ID>
```

### Issue: Lambda deployment package not found
```bash
# Ensure Lambda functions are packaged
cd ../lambda && npm run build
```

### Issue: Cognito triggers not working
```bash
# Check Lambda permissions
aws lambda get-policy --function-name <function-name>
```

### Issue: AppSync schema validation error
```bash
# Validate schema syntax
terraform plan
```

## Additional Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [DynamoDB Single-Table Design](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
