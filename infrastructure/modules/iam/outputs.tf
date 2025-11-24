# IAM Module Outputs

output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_execution_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.lambda_execution.name
}

output "appsync_service_role_arn" {
  description = "ARN of the AppSync service role"
  value       = aws_iam_role.appsync_service.arn
}

output "appsync_service_role_name" {
  description = "Name of the AppSync service role"
  value       = aws_iam_role.appsync_service.name
}

output "cognito_trigger_lambda_role_arn" {
  description = "ARN of the Cognito trigger Lambda role"
  value       = aws_iam_role.cognito_trigger_lambda.arn
}

output "cognito_trigger_lambda_role_name" {
  description = "Name of the Cognito trigger Lambda role"
  value       = aws_iam_role.cognito_trigger_lambda.name
}
