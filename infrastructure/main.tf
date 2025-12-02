# Main Terraform Configuration - Orchestrates All Modules

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# DynamoDB Module
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

# S3 Module
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# IAM Module (no dependencies on other modules)
module "iam" {
  source = "./modules/iam"

  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  aws_account_id        = data.aws_caller_identity.current.account_id
  dynamodb_table_arn    = module.dynamodb.table_arn
  s3_private_bucket_arn = module.s3.private_bucket_arn
  s3_public_bucket_arn  = module.s3.public_bucket_arn
  cognito_user_pool_arn = "arn:aws:cognito-idp:${var.aws_region}:${data.aws_caller_identity.current.account_id}:userpool/*"
}

# Cognito Module (no Lambda triggers yet)
module "cognito" {
  source = "./modules/cognito"

  project_name                 = var.project_name
  environment                  = var.environment
  pre_signup_lambda_arn        = ""
  post_confirmation_lambda_arn = ""
}

# Parameter Store Module (basic parameters)
module "parameters" {
  source = "./modules/parameters"

  project_name           = var.project_name
  environment            = var.environment
  gemini_api_key         = var.gemini_api_key
  appsync_url            = ""
  dynamodb_table_name    = module.dynamodb.table_name
  s3_private_bucket_name = module.s3.private_bucket_name
  s3_public_bucket_name  = module.s3.public_bucket_name
  cognito_user_pool_id   = module.cognito.user_pool_id
}

# Lambda Module
module "lambda" {
  source = "./modules/lambda"

  project_name                    = var.project_name
  environment                     = var.environment
  lambda_code_path                = "${path.root}/../lambda/dist/lambda.zip"
  lambda_layer_path               = "${path.root}/../lambda/layers/dependencies.zip"
  lambda_execution_role_arn       = module.iam.lambda_execution_role_arn
  cognito_trigger_lambda_role_arn = module.iam.cognito_trigger_lambda_role_arn
  dynamodb_table_name             = module.dynamodb.table_name
  s3_private_bucket_name          = module.s3.private_bucket_name
  s3_public_bucket_name           = module.s3.public_bucket_name
  cognito_user_pool_id            = module.cognito.user_pool_id
  gemini_api_key_parameter_name   = module.parameters.gemini_api_key_name

  depends_on = [module.iam, module.dynamodb, module.s3, module.cognito, module.parameters]
}

# AppSync Module
module "appsync" {
  source = "./modules/appsync"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region
  cognito_user_pool_id     = module.cognito.user_pool_id
  appsync_service_role_arn = module.iam.appsync_service_role_arn
  dynamodb_table_name      = module.dynamodb.table_name
  lambda_function_arns     = module.lambda.resolver_function_arns

  depends_on = [module.lambda, module.iam]
}

# Monitoring Module
module "monitoring" {
  source = "./modules/monitoring"

  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  appsync_api_id        = module.appsync.graphql_api_id
  dynamodb_table_name   = module.dynamodb.table_name
  lambda_function_names = module.lambda.all_function_names
  alert_email           = var.alert_email

  depends_on = [module.appsync, module.lambda]
}
