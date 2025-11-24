# AppSync Module Outputs

output "graphql_api_id" {
  description = "ID of the AppSync GraphQL API"
  value       = aws_appsync_graphql_api.main.id
}

output "graphql_api_arn" {
  description = "ARN of the AppSync GraphQL API"
  value       = aws_appsync_graphql_api.main.arn
}

output "graphql_url" {
  description = "GraphQL endpoint URL"
  value       = aws_appsync_graphql_api.main.uris["GRAPHQL"]
}

output "realtime_url" {
  description = "Real-time WebSocket endpoint URL"
  value       = aws_appsync_graphql_api.main.uris["REALTIME"]
}

output "api_key" {
  description = "AppSync API Key (if API_KEY auth is enabled)"
  value       = null
  sensitive   = true
}
