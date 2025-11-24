# Root Terraform Outputs

output "appsync_graphql_url" {
  description = "AppSync GraphQL API URL"
  value       = module.appsync.graphql_url
}

output "appsync_realtime_url" {
  description = "AppSync WebSocket URL for subscriptions"
  value       = module.appsync.realtime_url
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.user_pool_client_id
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.dynamodb.table_name
}

output "private_s3_bucket" {
  description = "Private S3 bucket name for uploads"
  value       = module.s3.private_bucket_name
}

output "public_s3_bucket" {
  description = "Public S3 bucket name for processed images"
  value       = module.s3.public_bucket_name
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch Dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${module.monitoring.dashboard_name}"
}
