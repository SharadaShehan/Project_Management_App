# Lambda Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
}

variable "lambda_code_path" {
  description = "Path to the Lambda deployment package (zip file)"
  type        = string
}

variable "lambda_layer_path" {
  description = "Path to the Lambda layer package (zip file)"
  type        = string
}

variable "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  type        = string
}

variable "cognito_trigger_lambda_role_arn" {
  description = "ARN of the Cognito trigger Lambda role"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "s3_private_bucket_name" {
  description = "Name of the private S3 bucket"
  type        = string
}

variable "s3_public_bucket_name" {
  description = "Name of the public S3 bucket"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "gemini_api_key_parameter_name" {
  description = "SSM parameter name for Gemini API key"
  type        = string
}
