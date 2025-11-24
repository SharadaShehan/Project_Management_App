# Cognito Module Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
}

variable "pre_signup_lambda_arn" {
  description = "ARN of the Lambda function for pre-signup trigger"
  type        = string
  default     = ""
}

variable "post_confirmation_lambda_arn" {
  description = "ARN of the Lambda function for post-confirmation trigger"
  type        = string
  default     = ""
}
