# Monitoring Module Outputs

output "appsync_log_group_name" {
  description = "Name of the AppSync CloudWatch log group"
  value       = aws_cloudwatch_log_group.appsync.name
}

output "appsync_log_group_arn" {
  description = "ARN of the AppSync CloudWatch log group"
  value       = aws_cloudwatch_log_group.appsync.arn
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}
