# AppSync Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool for authentication"
  type        = string
}

variable "appsync_service_role_arn" {
  description = "ARN of the AppSync service role"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "lambda_function_arns" {
  description = "Map of Lambda function ARNs for data sources"
  type        = map(string)
}
