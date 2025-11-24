# Parameter Store Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
}

variable "gemini_api_key" {
  description = "Google Gemini API Key for AI features"
  type        = string
  sensitive   = true
}

variable "appsync_url" {
  description = "AWS AppSync GraphQL API URL"
  type        = string
  default     = ""
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name"
  type        = string
}

variable "s3_private_bucket_name" {
  description = "S3 private bucket name"
  type        = string
}

variable "s3_public_bucket_name" {
  description = "S3 public bucket name"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}
