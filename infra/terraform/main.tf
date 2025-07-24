// Terraform configuration for infrastructure provisioning
// Epic 1: Infrastructure Setup – Placeholder

terraform {
  required_version = ">= 1.0.0"
}

provider "aws" {
  region = var.aws_region
}

# Remote state backend
terraform {
  backend "s3" {
    bucket = "${var.project_name}-tfstate"
    key    = "${var.environment}/terraform.tfstate"
    region = var.aws_region
    dynamodb_table = "${var.project_name}-tfstate-lock"
    encrypt = true
  }
}

# Tagging locals
locals {
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Minimal VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags       = local.tags
}

# Example IAM role (least privilege)
resource "aws_iam_role" "app" {
  name = "${var.project_name}-app-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
  tags = local.tags
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

