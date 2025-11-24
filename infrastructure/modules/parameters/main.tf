# Parameter Store Module - Secure Configuration Management

# Gemini API Key (SecureString parameter)
resource "aws_ssm_parameter" "gemini_api_key" {
  name        = "/${var.project_name}/${var.environment}/gemini-api-key"
  description = "Google Gemini API Key for AI-generated forum post answers"
  type        = "SecureString"
  value       = var.gemini_api_key

  tags = {
    Name = "${var.project_name}-${var.environment}-gemini-api-key"
  }
}

# AppSync API URL (for Lambda functions to reference)
resource "aws_ssm_parameter" "appsync_url" {
  name        = "/${var.project_name}/${var.environment}/appsync-url"
  description = "AWS AppSync GraphQL API URL"
  type        = "String"
  value       = var.appsync_url != "" ? var.appsync_url : "PLACEHOLDER"

  tags = {
    Name = "${var.project_name}-${var.environment}-appsync-url"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

# DynamoDB Table Name (for reference)
resource "aws_ssm_parameter" "dynamodb_table" {
  name        = "/${var.project_name}/${var.environment}/dynamodb-table-name"
  description = "DynamoDB table name for application data"
  type        = "String"
  value       = var.dynamodb_table_name

  tags = {
    Name = "${var.project_name}-${var.environment}-dynamodb-table-name"
  }
}

# Private S3 Bucket Name
resource "aws_ssm_parameter" "s3_private_bucket" {
  name        = "/${var.project_name}/${var.environment}/s3-private-bucket"
  description = "S3 bucket name for private assets (user profiles)"
  type        = "String"
  value       = var.s3_private_bucket_name

  tags = {
    Name = "${var.project_name}-${var.environment}-s3-private-bucket"
  }
}

# Public S3 Bucket Name
resource "aws_ssm_parameter" "s3_public_bucket" {
  name        = "/${var.project_name}/${var.environment}/s3-public-bucket"
  description = "S3 bucket name for public assets (project logos)"
  type        = "String"
  value       = var.s3_public_bucket_name

  tags = {
    Name = "${var.project_name}-${var.environment}-s3-public-bucket"
  }
}

# Cognito User Pool ID
resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name        = "/${var.project_name}/${var.environment}/cognito-user-pool-id"
  description = "Cognito User Pool ID for authentication"
  type        = "String"
  value       = var.cognito_user_pool_id

  tags = {
    Name = "${var.project_name}-${var.environment}-cognito-user-pool-id"
  }
}
