#!/bin/bash

# Test Script for AWS Serverless Deployment
# Validates that all services are working correctly

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 AWS Serverless Deployment - Testing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_test() {
    echo -n "Testing $1... "
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC}"
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Error: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "  Warning: $1"
}

# Get Terraform outputs
cd infrastructure 2>/dev/null || {
    echo -e "${RED}Error: infrastructure directory not found${NC}"
    exit 1
}

echo "📋 Retrieving configuration..."
APPSYNC_API_ID=$(terraform output -raw appsync_api_id 2>/dev/null || echo "")
APPSYNC_ENDPOINT=$(terraform output -raw appsync_endpoint 2>/dev/null || echo "")
COGNITO_USER_POOL_ID=$(terraform output -raw cognito_user_pool_id 2>/dev/null || echo "")
COGNITO_CLIENT_ID=$(terraform output -raw cognito_client_id 2>/dev/null || echo "")
DYNAMODB_TABLE=$(terraform output -raw dynamodb_table_name 2>/dev/null || echo "")
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1")

cd ..

if [ -z "$APPSYNC_API_ID" ]; then
    echo -e "${RED}Error: Could not retrieve Terraform outputs${NC}"
    echo "Make sure Terraform has been applied successfully"
    exit 1
fi

echo -e "${GREEN}✓ Configuration retrieved${NC}"
echo ""

# Test 1: AWS CLI
print_test "AWS CLI configuration"
if aws sts get-caller-identity &>/dev/null; then
    print_pass
else
    print_fail "AWS CLI not configured"
    exit 1
fi

# Test 2: DynamoDB Table
print_test "DynamoDB table"
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION" &>/dev/null; then
    print_pass
else
    print_fail "DynamoDB table not found"
fi

# Test 3: Cognito User Pool
print_test "Cognito User Pool"
if aws cognito-idp describe-user-pool --user-pool-id "$COGNITO_USER_POOL_ID" --region "$AWS_REGION" &>/dev/null; then
    print_pass
else
    print_fail "Cognito User Pool not found"
fi

# Test 4: AppSync API
print_test "AppSync GraphQL API"
if aws appsync get-graphql-api --api-id "$APPSYNC_API_ID" --region "$AWS_REGION" &>/dev/null; then
    print_pass
else
    print_fail "AppSync API not found"
fi

# Test 5: Lambda Functions
print_test "Lambda functions"
LAMBDA_COUNT=$(aws lambda list-functions --region "$AWS_REGION" --query 'Functions[?starts_with(FunctionName, `project-mgmt-`)].FunctionName' --output text | wc -w)
if [ "$LAMBDA_COUNT" -ge 40 ]; then
    print_pass
    echo "  Found $LAMBDA_COUNT Lambda functions"
else
    print_warning "Expected 43 Lambda functions, found $LAMBDA_COUNT"
fi

# Test 6: S3 Buckets
print_test "S3 buckets"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PRIVATE_BUCKET="project-mgmt-private-${ACCOUNT_ID}"
PUBLIC_BUCKET="project-mgmt-public-${ACCOUNT_ID}"

PRIVATE_EXISTS=$(aws s3 ls "s3://${PRIVATE_BUCKET}" &>/dev/null && echo "yes" || echo "no")
PUBLIC_EXISTS=$(aws s3 ls "s3://${PUBLIC_BUCKET}" &>/dev/null && echo "yes" || echo "no")

if [ "$PRIVATE_EXISTS" = "yes" ] && [ "$PUBLIC_EXISTS" = "yes" ]; then
    print_pass
    echo "  Private bucket: ${PRIVATE_BUCKET}"
    echo "  Public bucket: ${PUBLIC_BUCKET}"
else
    print_warning "Not all S3 buckets found"
    echo "  Private: $PRIVATE_EXISTS, Public: $PUBLIC_EXISTS"
fi

# Test 7: CloudWatch Log Groups
print_test "CloudWatch log groups"
LOG_GROUP_COUNT=$(aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/project-mgmt-" --region "$AWS_REGION" --query 'logGroups[].logGroupName' --output text | wc -w)
if [ "$LOG_GROUP_COUNT" -ge 40 ]; then
    print_pass
    echo "  Found $LOG_GROUP_COUNT log groups"
else
    print_warning "Expected 43+ log groups, found $LOG_GROUP_COUNT"
fi

# Test 8: SSM Parameter
print_test "SSM Parameter Store"
if aws ssm get-parameter --name "/project-management/gemini-api-key" --region "$AWS_REGION" &>/dev/null; then
    print_pass
else
    print_warning "Gemini API key not found in Parameter Store"
    echo "  Set it with: aws ssm put-parameter --name '/project-management/gemini-api-key' --value 'YOUR_KEY' --type 'SecureString'"
fi

# Test 9: AppSync Schema
print_test "AppSync GraphQL schema"
SCHEMA=$(aws appsync get-introspection-schema --api-id "$APPSYNC_API_ID" --format SDL --region "$AWS_REGION" 2>/dev/null || echo "")
if [ -n "$SCHEMA" ]; then
    print_pass
    TYPE_COUNT=$(echo "$SCHEMA" | grep -c "^type " || true)
    echo "  Schema contains $TYPE_COUNT types"
else
    print_fail "Could not retrieve schema"
fi

# Test 10: Lambda Layer
print_test "Lambda layer"
LAYER_VERSION=$(aws lambda list-layer-versions --layer-name "project-mgmt-dependencies" --region "$AWS_REGION" --query 'LayerVersions[0].Version' --output text 2>/dev/null || echo "")
if [ -n "$LAYER_VERSION" ] && [ "$LAYER_VERSION" != "None" ]; then
    print_pass
    echo "  Layer version: $LAYER_VERSION"
else
    print_warning "Lambda layer not found or not deployed"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "AppSync Endpoint:    $APPSYNC_ENDPOINT"
echo "Cognito User Pool:   $COGNITO_USER_POOL_ID"
echo "Cognito Client ID:   $COGNITO_CLIENT_ID"
echo "DynamoDB Table:      $DYNAMODB_TABLE"
echo "AWS Region:          $AWS_REGION"
echo ""
echo "Lambda Functions:    $LAMBDA_COUNT"
echo "CloudWatch Logs:     $LOG_GROUP_COUNT"
echo "S3 Buckets:          Private: $PRIVATE_EXISTS, Public: $PUBLIC_EXISTS"
echo ""

# Optional: Test a sample GraphQL query
echo "🔬 Optional: Test GraphQL endpoint"
echo ""
echo "To test the GraphQL API, you can use the AWS AppSync console:"
echo "https://console.aws.amazon.com/appsync/home?region=${AWS_REGION}#/${APPSYNC_API_ID}/v1/queries"
echo ""
echo "Or use curl with a valid JWT token:"
echo "curl -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -d '{\"query\":\"{ __typename }\"}' \\"
echo "  $APPSYNC_ENDPOINT"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
