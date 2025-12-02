# Simple Configuration Generator
$ErrorActionPreference = "Stop"

Write-Host "Generating configuration..." -ForegroundColor Cyan

# Get outputs from Terraform
cd infrastructure
$cognitoPoolId = terraform output -raw cognito_user_pool_id
$cognitoClientId = terraform output -raw cognito_user_pool_client_id  
$appsyncUrl = terraform output -raw appsync_graphql_url
$privateBucket = terraform output -raw private_s3_bucket
$publicBucket = terraform output -raw public_s3_bucket
cd ..

# Create frontend config file
$configJS = @"
const awsConfig = {
  aws_project_region: 'us-east-1',
  
  Auth: {
    region: 'us-east-1',
    userPoolId: '$cognitoPoolId',
    userPoolWebClientId: '$cognitoClientId',
    mandatorySignIn: true
  },
  
  aws_appsync_graphqlEndpoint: '$appsyncUrl',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  
  Storage: {
    AWSS3: {
      bucket: '$privateBucket',
      region: 'us-east-1'
    }
  }
};

export default awsConfig;
"@

$configJS | Out-File -FilePath "frontend\src\aws-config.js" -Encoding UTF8

Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "  Cognito Pool: $cognitoPoolId"
Write-Host "  Cognito Client: $cognitoClientId"
Write-Host "  AppSync URL: $appsyncUrl"
Write-Host "  Private S3: $privateBucket"
Write-Host "  Public S3: $publicBucket"
Write-Host ""
Write-Host "Configuration file created at frontend\src\aws-config.js" -ForegroundColor Green
