# Parameter Store Module Outputs

output "gemini_api_key_arn" {
  description = "ARN of the Gemini API Key parameter"
  value       = aws_ssm_parameter.gemini_api_key.arn
}

output "gemini_api_key_name" {
  description = "Name of the Gemini API Key parameter"
  value       = aws_ssm_parameter.gemini_api_key.name
}

output "appsync_url_parameter_name" {
  description = "Name of the AppSync URL parameter"
  value       = aws_ssm_parameter.appsync_url.name
}

output "dynamodb_table_parameter_name" {
  description = "Name of the DynamoDB table parameter"
  value       = aws_ssm_parameter.dynamodb_table.name
}

output "s3_private_bucket_parameter_name" {
  description = "Name of the S3 private bucket parameter"
  value       = aws_ssm_parameter.s3_private_bucket.name
}

output "s3_public_bucket_parameter_name" {
  description = "Name of the S3 public bucket parameter"
  value       = aws_ssm_parameter.s3_public_bucket.name
}

output "cognito_user_pool_id_parameter_name" {
  description = "Name of the Cognito User Pool ID parameter"
  value       = aws_ssm_parameter.cognito_user_pool_id.name
}
