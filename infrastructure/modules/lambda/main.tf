# Lambda Module - Function Definitions for GraphQL Resolvers

# Local variables for common configurations
locals {
  lambda_runtime = "nodejs20.x"
  lambda_timeout = 30
  lambda_memory  = 512

  common_environment_vars = {
    DYNAMODB_TABLE_NAME                 = var.dynamodb_table_name
    S3_PRIVATE_BUCKET                   = var.s3_private_bucket_name
    S3_PUBLIC_BUCKET                    = var.s3_public_bucket_name
    COGNITO_USER_POOL_ID                = var.cognito_user_pool_id
    GEMINI_API_KEY_PARAM                = var.gemini_api_key_parameter_name
    AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
  }

  # Lambda function definitions
  lambda_functions = {
    # User resolvers
    "user-signup"         = { handler = "user/signup.handler", description = "User signup resolver" }
    "user-login"          = { handler = "user/login.handler", description = "User login resolver" }
    "user-update-profile" = { handler = "user/updateProfile.handler", description = "Update user profile resolver" }
    "user-get-profile"    = { handler = "user/getProfile.handler", description = "Get user profile resolver" }

    # Project resolvers
    "project-create"      = { handler = "project/create.handler", description = "Create project resolver" }
    "project-get"         = { handler = "project/get.handler", description = "Get project resolver" }
    "project-update"      = { handler = "project/update.handler", description = "Update project resolver" }
    "project-delete"      = { handler = "project/delete.handler", description = "Delete project resolver" }
    "project-list"        = { handler = "project/list.handler", description = "List projects resolver" }
    "project-invite-user" = { handler = "project/inviteUser.handler", description = "Invite user to project resolver" }
    "project-get-members" = { handler = "project/getMembers.handler", description = "Get project members resolver" }

    # Process resolvers
    "process-create" = { handler = "process/create.handler", description = "Create process resolver" }
    "process-get"    = { handler = "process/get.handler", description = "Get process resolver" }
    "process-update" = { handler = "process/update.handler", description = "Update process resolver" }
    "process-delete" = { handler = "process/delete.handler", description = "Delete process resolver" }
    "process-list"   = { handler = "process/list.handler", description = "List processes resolver" }

    # Phase resolvers
    "phase-create" = { handler = "phase/create.handler", description = "Create phase resolver" }
    "phase-get"    = { handler = "phase/get.handler", description = "Get phase resolver" }
    "phase-update" = { handler = "phase/update.handler", description = "Update phase resolver" }
    "phase-delete" = { handler = "phase/delete.handler", description = "Delete phase resolver" }
    "phase-list"   = { handler = "phase/list.handler", description = "List phases resolver" }

    # Task resolvers
    "task-create"        = { handler = "task/create.handler", description = "Create task resolver" }
    "task-get"           = { handler = "task/get.handler", description = "Get task resolver" }
    "task-update"        = { handler = "task/update.handler", description = "Update task resolver" }
    "task-delete"        = { handler = "task/delete.handler", description = "Delete task resolver" }
    "task-list"          = { handler = "task/list.handler", description = "List tasks resolver" }
    "task-update-status" = { handler = "task/updateStatus.handler", description = "Update task status resolver" }

    # Forum resolvers
    "forum-create-post"        = { handler = "forum/create.handler", description = "Create forum post resolver" }
    "forum-get-post"           = { handler = "forum/get.handler", description = "Get forum post resolver" }
    "forum-delete-post"        = { handler = "forum/delete.handler", description = "Delete forum post resolver" }
    "forum-list-posts"         = { handler = "forum/list.handler", description = "List forum posts resolver" }
    "forum-create-reply"       = { handler = "forum/createReply.handler", description = "Create forum reply resolver" }
    "forum-delete-reply"       = { handler = "forum/deleteReply.handler", description = "Delete forum reply resolver" }
    "forum-upvote-post"        = { handler = "forum/upvotePost.handler", description = "Upvote forum post resolver" }
    "forum-downvote-post"      = { handler = "forum/downvotePost.handler", description = "Downvote forum post resolver" }
    "forum-upvote-reply"       = { handler = "forum/upvoteReply.handler", description = "Upvote forum reply resolver" }
    "forum-downvote-reply"     = { handler = "forum/downvoteReply.handler", description = "Downvote forum reply resolver" }
    "forum-generate-ai-answer" = { handler = "forum/generateAIAnswer.handler", description = "Generate AI answer with Gemini" }

    # Message resolvers
    "message-send"         = { handler = "message/send.handler", description = "Send message resolver" }
    "message-list-private" = { handler = "message/listPrivate.handler", description = "List private messages resolver" }
    "message-list-project" = { handler = "message/listProject.handler", description = "List project messages resolver" }
    "message-list-phase"   = { handler = "message/listPhase.handler", description = "List phase messages resolver" }

    # Request resolvers
    "request-create"  = { handler = "request/create.handler", description = "Create request resolver" }
    "request-list"    = { handler = "request/list.handler", description = "List requests resolver" }
    "request-accept"  = { handler = "request/accept.handler", description = "Accept request resolver" }
    "request-decline" = { handler = "request/decline.handler", description = "Decline request resolver" }

    # Image processing
    "image-generate-presigned-url" = { handler = "image/generatePresignedUrl.handler", description = "Generate S3 presigned URL" }
  }

  # Cognito trigger functions
  cognito_trigger_functions = {
    "cognito-pre-signup"        = { handler = "cognito/preSignup.handler", description = "Cognito pre-signup trigger" }
    "cognito-post-confirmation" = { handler = "cognito/postConfirmation.handler", description = "Cognito post-confirmation trigger" }
  }
}

# Lambda Layer for shared dependencies
resource "aws_lambda_layer_version" "dependencies" {
  filename            = var.lambda_layer_path
  layer_name          = "${var.project_name}-${var.environment}-dependencies"
  compatible_runtimes = [local.lambda_runtime]
  description         = "Shared dependencies: AWS SDK v3, uuid, etc."

  source_code_hash = filebase64sha256(var.lambda_layer_path)
}

# Main Lambda functions
resource "aws_lambda_function" "resolvers" {
  for_each = local.lambda_functions

  filename         = var.lambda_code_path
  function_name    = "${var.project_name}-${var.environment}-${each.key}"
  role             = var.lambda_execution_role_arn
  handler          = each.value.handler
  source_code_hash = filebase64sha256(var.lambda_code_path)
  runtime          = local.lambda_runtime
  timeout          = local.lambda_timeout
  memory_size      = local.lambda_memory
  description      = each.value.description

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = local.common_environment_vars
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  }
}

# Cognito Trigger Lambda functions (separate role)
resource "aws_lambda_function" "cognito_triggers" {
  for_each = local.cognito_trigger_functions

  filename         = var.lambda_code_path
  function_name    = "${var.project_name}-${var.environment}-${each.key}"
  role             = var.cognito_trigger_lambda_role_arn
  handler          = each.value.handler
  source_code_hash = filebase64sha256(var.lambda_code_path)
  runtime          = local.lambda_runtime
  timeout          = 10
  memory_size      = 256
  description      = each.value.description

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = var.dynamodb_table_name
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  }
}

# CloudWatch Log Groups for Lambda functions
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = merge(local.lambda_functions, local.cognito_trigger_functions)

  name              = "/aws/lambda/${var.project_name}-${var.environment}-${each.key}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}-logs"
  }
}
