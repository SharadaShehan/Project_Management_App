# Cognito Module - User Authentication

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-user-pool"

  # Username configuration
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  username_configuration {
    case_sensitive = false
  }

  # Password policy matching current validation (8-30 chars)
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # Custom attributes for user profile
  schema {
    name                = "country"
    attribute_data_type = "String"
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 100
    }
  }

  schema {
    name                = "gender"
    attribute_data_type = "String"
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 50
    }
  }

  schema {
    name                = "secondaryEmail"
    attribute_data_type = "String"
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Verification message template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your Project Management App Verification Code"
    email_message        = "Your verification code is {####}"
  }

  # Lambda triggers (only if ARNs are provided)
  dynamic "lambda_config" {
    for_each = var.pre_signup_lambda_arn != "" || var.post_confirmation_lambda_arn != "" ? [1] : []
    content {
      pre_sign_up       = var.pre_signup_lambda_arn != "" ? var.pre_signup_lambda_arn : null
      post_confirmation = var.post_confirmation_lambda_arn != "" ? var.post_confirmation_lambda_arn : null
    }
  }

  # User pool tags
  tags = {
    Name = "${var.project_name}-${var.environment}-user-pool"
  }
}

# User Pool Client for React Native app
resource "aws_cognito_user_pool_client" "app" {
  name         = "${var.project_name}-${var.environment}-app-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Token validity
  refresh_token_validity = 30 # days
  access_token_validity  = 1  # hour
  id_token_validity      = 1  # hour
  token_validity_units {
    refresh_token = "days"
    access_token  = "hours"
    id_token      = "hours"
  }

  # OAuth settings
  generate_secret                               = false # For mobile apps
  prevent_user_existence_errors                 = "ENABLED"
  enable_token_revocation                       = true
  enable_propagate_additional_user_context_data = false

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  # Read and write attributes
  read_attributes = [
    "email"
  ]

  write_attributes = [
    "email"
  ]
}

# Lambda permissions for Cognito triggers
resource "aws_lambda_permission" "pre_signup" {
  count = var.pre_signup_lambda_arn != "" ? 1 : 0

  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = var.pre_signup_lambda_arn
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

resource "aws_lambda_permission" "post_confirmation" {
  count = var.post_confirmation_lambda_arn != "" ? 1 : 0

  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = var.post_confirmation_lambda_arn
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
