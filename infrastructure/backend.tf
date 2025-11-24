# Terraform State Backend Configuration
# This file configures remote state storage in S3 with DynamoDB locking
# 
# Prerequisites:
# 1. Create S3 bucket manually: aws s3 mb s3://project-management-app-terraform-state
# 2. Enable versioning: aws s3api put-bucket-versioning --bucket project-management-app-terraform-state --versioning-configuration Status=Enabled
# 3. Create DynamoDB table: aws dynamodb create-table --table-name terraform-state-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST

terraform {
  backend "s3" {
    bucket         = "project-mgmt-terraform-state-565686646017"
    key            = "project-management/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }

  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
