# IAM Module - Roles and Policies for Serverless Services

# Lambda Execution Role
resource "aws_iam_role" "lambda_execution" {
  name               = "${var.project_name}-${var.environment}-lambda-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-lambda-execution-role"
  }
}

# Lambda CloudWatch Logs Policy
resource "aws_iam_role_policy" "lambda_cloudwatch_logs" {
  name = "cloudwatch-logs-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.project_name}-${var.environment}-*:*"
      }
    ]
  })
}

# Lambda DynamoDB Policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "dynamodb-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:ConditionCheckItem"
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      }
    ]
  })
}

# Lambda S3 Policy
resource "aws_iam_role_policy" "lambda_s3" {
  name = "s3-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_private_bucket_arn,
          "${var.s3_private_bucket_arn}/*",
          var.s3_public_bucket_arn,
          "${var.s3_public_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersion"
        ]
        Resource = [
          "${var.s3_private_bucket_arn}/*",
          "${var.s3_public_bucket_arn}/*"
        ]
      }
    ]
  })
}

# Lambda SSM Parameter Store Policy (for Gemini API key)
resource "aws_iam_role_policy" "lambda_ssm" {
  name = "ssm-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter/${var.project_name}/${var.environment}/*"
      }
    ]
  })
}

# Lambda Cognito Policy (for user management)
resource "aws_iam_role_policy" "lambda_cognito" {
  name = "cognito-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:ListUsers"
        ]
        Resource = var.cognito_user_pool_arn
      }
    ]
  })
}

# AppSync Service Role
resource "aws_iam_role" "appsync_service" {
  name               = "${var.project_name}-${var.environment}-appsync-service-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-appsync-service-role"
  }
}

# AppSync Lambda Invoke Policy
resource "aws_iam_role_policy" "appsync_lambda" {
  name = "lambda-invoke-policy"
  role = aws_iam_role.appsync_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = "arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${var.project_name}-${var.environment}-*"
      }
    ]
  })
}

# AppSync DynamoDB Policy (for VTL resolvers)
resource "aws_iam_role_policy" "appsync_dynamodb" {
  name = "dynamodb-policy"
  role = aws_iam_role.appsync_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      }
    ]
  })
}

# AppSync CloudWatch Logs Policy
resource "aws_iam_role_policy" "appsync_cloudwatch" {
  name = "cloudwatch-logs-policy"
  role = aws_iam_role.appsync_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/appsync/apis/*:*"
      }
    ]
  })
}

# Cognito Trigger Lambda Role (for pre-signup and post-confirmation)
resource "aws_iam_role" "cognito_trigger_lambda" {
  name               = "${var.project_name}-${var.environment}-cognito-trigger-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-cognito-trigger-role"
  }
}

# Cognito Trigger Lambda CloudWatch Logs
resource "aws_iam_role_policy" "cognito_trigger_cloudwatch" {
  name = "cloudwatch-logs-policy"
  role = aws_iam_role.cognito_trigger_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.project_name}-${var.environment}-cognito-*:*"
      }
    ]
  })
}

# Cognito Trigger Lambda DynamoDB Policy
resource "aws_iam_role_policy" "cognito_trigger_dynamodb" {
  name = "dynamodb-policy"
  role = aws_iam_role.cognito_trigger_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })
}
