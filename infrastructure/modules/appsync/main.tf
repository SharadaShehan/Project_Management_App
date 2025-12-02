# AppSync Module - GraphQL API Configuration

# AppSync GraphQL API
resource "aws_appsync_graphql_api" "main" {
  name                = "${var.project_name}-${var.environment}-api"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"

  user_pool_config {
    aws_region     = var.aws_region
    default_action = "ALLOW"
    user_pool_id   = var.cognito_user_pool_id
  }

  log_config {
    cloudwatch_logs_role_arn = var.appsync_service_role_arn
    field_log_level          = "ERROR"
  }

  schema = file("${path.module}/schema.graphql")

  tags = {
    Name = "${var.project_name}-${var.environment}-appsync-api"
  }
}

# DynamoDB Data Source (for VTL resolvers)
resource "aws_appsync_datasource" "dynamodb" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "DynamoDBDataSource"
  service_role_arn = var.appsync_service_role_arn
  type             = "AMAZON_DYNAMODB"

  dynamodb_config {
    table_name = var.dynamodb_table_name
  }
}

# Lambda Data Sources
resource "aws_appsync_datasource" "lambda" {
  for_each = var.lambda_function_arns

  api_id           = aws_appsync_graphql_api.main.id
  name             = replace(each.key, "-", "_")
  service_role_arn = var.appsync_service_role_arn
  type             = "AWS_LAMBDA"

  lambda_config {
    function_arn = each.value
  }
}

# Lambda Permissions for AppSync
resource "aws_lambda_permission" "appsync" {
  for_each = var.lambda_function_arns

  statement_id  = "AllowExecutionFromAppSync"
  action        = "lambda:InvokeFunction"
  function_name = split(":", each.value)[6]
  principal     = "appsync.amazonaws.com"
  source_arn    = "${aws_appsync_graphql_api.main.arn}/*"
}

# Standard resolver code template
locals {
  standard_resolver_code = <<EOF
export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      arguments: ctx.arguments,
      identity: ctx.identity,
      source: ctx.source,
      request: ctx.request
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
EOF
}

# Query Resolvers
resource "aws_appsync_resolver" "query_me" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "me"
  data_source = aws_appsync_datasource.lambda["user-get-profile"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_projects" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "projects"
  data_source = aws_appsync_datasource.lambda["project-list"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_project" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "project"
  data_source = aws_appsync_datasource.lambda["project-get"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_posts" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "posts"
  data_source = aws_appsync_datasource.lambda["forum-list-posts"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_post" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "post"
  data_source = aws_appsync_datasource.lambda["forum-get-post"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_private_messages" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "privateMessages"
  data_source = aws_appsync_datasource.lambda["message-list-private"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_project_messages" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "projectMessages"
  data_source = aws_appsync_datasource.lambda["message-list-project"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_phase_messages" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "phaseMessages"
  data_source = aws_appsync_datasource.lambda["message-list-phase"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_last_private_messages" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "lastPrivateMessages"
  data_source = aws_appsync_datasource.lambda["message-list-private"].name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_last_project_messages" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "lastProjectMessages"
  data_source = aws_appsync_datasource.lambda["message-list-project"].name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_last_phase_messages" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "lastPhaseMessages"
  data_source = aws_appsync_datasource.lambda["message-list-phase"].name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_sent_requests" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "sentRequests"
  data_source = aws_appsync_datasource.lambda["request-list"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "query_received_requests" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Query"
  field       = "receivedRequests"
  data_source = aws_appsync_datasource.lambda["request-list"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Mutation Resolvers - User
resource "aws_appsync_resolver" "mutation_sign_up" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "signUp"
  data_source = aws_appsync_datasource.lambda["user-signup"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_sign_in" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "signIn"
  data_source = aws_appsync_datasource.lambda["user-login"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_update_profile" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "updateProfile"
  data_source = aws_appsync_datasource.lambda["user-update-profile"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Mutation Resolvers - Project
resource "aws_appsync_resolver" "mutation_create_project" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createProject"
  data_source = aws_appsync_datasource.lambda["project-create"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_update_project" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "updateProject"
  data_source = aws_appsync_datasource.lambda["project-update"].name

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_delete_project" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "deleteProject"
  data_source = aws_appsync_datasource.lambda["project-delete"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Mutation Resolvers - Forum
resource "aws_appsync_resolver" "mutation_create_post" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createPost"
  data_source = aws_appsync_datasource.lambda["forum-create-post"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_delete_post" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "deletePost"
  data_source = aws_appsync_datasource.lambda["forum-delete-post"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_reply_post" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "replyPost"
  data_source = aws_appsync_datasource.lambda["forum-create-reply"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_delete_reply" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "deleteReply"
  data_source = aws_appsync_datasource.lambda["forum-delete-reply"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_upvote_post" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "upvotePost"
  data_source = aws_appsync_datasource.lambda["forum-upvote-post"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_downvote_post" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "downvotePost"
  data_source = aws_appsync_datasource.lambda["forum-downvote-post"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_upvote_reply" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "upvoteReply"
  data_source = aws_appsync_datasource.lambda["forum-upvote-reply"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_downvote_reply" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "downvoteReply"
  data_source = aws_appsync_datasource.lambda["forum-downvote-reply"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_get_gemini_response" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "getGeminiResponseForPost"
  data_source = aws_appsync_datasource.lambda["forum-generate-ai-answer"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Mutation Resolvers - Message
resource "aws_appsync_resolver" "mutation_create_private_message" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createPrivateMessage"
  data_source = aws_appsync_datasource.lambda["message-send"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_create_project_message" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createProjectMessage"
  data_source = aws_appsync_datasource.lambda["message-send"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_create_phase_message" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createPhaseMessage"
  data_source = aws_appsync_datasource.lambda["message-send"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Mutation Resolvers - Request
resource "aws_appsync_resolver" "mutation_create_requests" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createRequests"
  data_source = aws_appsync_datasource.lambda["request-create"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_respond_request" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "respondRequest"
  data_source = aws_appsync_datasource.lambda["request-accept"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Mutation Resolvers - Image
resource "aws_appsync_resolver" "mutation_get_presigned_url" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "getPresignedURL"
  data_source = aws_appsync_datasource.lambda["image-generate-presigned-url"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Process Mutations
resource "aws_appsync_resolver" "mutation_create_process" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createProcess"
  data_source = aws_appsync_datasource.lambda["process-create"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_update_process" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "updateProcess"
  data_source = aws_appsync_datasource.lambda["process-update"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_delete_process" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "deleteProcess"
  data_source = aws_appsync_datasource.lambda["process-delete"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Phase Mutations
resource "aws_appsync_resolver" "mutation_create_phase" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createPhase"
  data_source = aws_appsync_datasource.lambda["phase-create"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_update_phase" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "updatePhase"
  data_source = aws_appsync_datasource.lambda["phase-update"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_delete_phase" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "deletePhase"
  data_source = aws_appsync_datasource.lambda["phase-delete"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

# Task Mutations
resource "aws_appsync_resolver" "mutation_create_task" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "createTask"
  data_source = aws_appsync_datasource.lambda["task-create"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_update_task" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "updateTask"
  data_source = aws_appsync_datasource.lambda["task-update"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_delete_task" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "deleteTask"
  data_source = aws_appsync_datasource.lambda["task-delete"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}

resource "aws_appsync_resolver" "mutation_update_task_status" {
  api_id      = aws_appsync_graphql_api.main.id
  type        = "Mutation"
  field       = "updateTaskStatus"
  data_source = aws_appsync_datasource.lambda["task-update-status"].name
  
  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  
  code = local.standard_resolver_code
}
