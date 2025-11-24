# Lambda Module Outputs

output "resolver_function_arns" {
  description = "Map of Lambda resolver function ARNs"
  value       = { for k, v in aws_lambda_function.resolvers : k => v.arn }
}

output "resolver_function_names" {
  description = "Map of Lambda resolver function names"
  value       = { for k, v in aws_lambda_function.resolvers : k => v.function_name }
}

output "cognito_trigger_function_arns" {
  description = "Map of Cognito trigger Lambda function ARNs"
  value       = { for k, v in aws_lambda_function.cognito_triggers : k => v.arn }
}

output "cognito_trigger_function_names" {
  description = "Map of Cognito trigger Lambda function names"
  value       = { for k, v in aws_lambda_function.cognito_triggers : k => v.function_name }
}

output "lambda_layer_arn" {
  description = "ARN of the Lambda layer"
  value       = aws_lambda_layer_version.dependencies.arn
}

output "all_function_names" {
  description = "List of all Lambda function names for monitoring"
  value       = concat(
    [for v in aws_lambda_function.resolvers : v.function_name],
    [for v in aws_lambda_function.cognito_triggers : v.function_name]
  )
}

# Individual function ARNs for AppSync data source configuration
output "user_signup_arn" {
  value = aws_lambda_function.resolvers["user-signup"].arn
}

output "user_login_arn" {
  value = aws_lambda_function.resolvers["user-login"].arn
}

output "user_update_profile_arn" {
  value = aws_lambda_function.resolvers["user-update-profile"].arn
}

output "user_get_profile_arn" {
  value = aws_lambda_function.resolvers["user-get-profile"].arn
}

output "project_create_arn" {
  value = aws_lambda_function.resolvers["project-create"].arn
}

output "project_get_arn" {
  value = aws_lambda_function.resolvers["project-get"].arn
}

output "project_update_arn" {
  value = aws_lambda_function.resolvers["project-update"].arn
}

output "project_delete_arn" {
  value = aws_lambda_function.resolvers["project-delete"].arn
}

output "project_list_arn" {
  value = aws_lambda_function.resolvers["project-list"].arn
}

output "project_invite_user_arn" {
  value = aws_lambda_function.resolvers["project-invite-user"].arn
}

output "project_get_members_arn" {
  value = aws_lambda_function.resolvers["project-get-members"].arn
}

output "cognito_pre_signup_arn" {
  value = aws_lambda_function.cognito_triggers["cognito-pre-signup"].arn
}

output "cognito_post_confirmation_arn" {
  value = aws_lambda_function.cognito_triggers["cognito-post-confirmation"].arn
}
