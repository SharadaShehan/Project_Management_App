# Monitoring Module Variables

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

variable "appsync_api_id" {
  description = "AppSync API ID for monitoring"
  type        = string
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for monitoring"
  type        = string
}

variable "lambda_function_names" {
  description = "List of Lambda function names to monitor"
  type        = list(string)
}

variable "alert_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
}
