provider "aws" {
  region = "us-east-1"
}

# Basic GuardDuty detector for Amplify
resource "aws_guardduty_detector" "main" {
  enable = true
}

# WAF with enhanced rules
resource "aws_wafv2_web_acl" "amplify_acl" {
  name        = "amplify-waf"
  description = "WAF for Amplify CloudFront"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "amplify-waf"
    sampled_requests_enabled   = true
  }

  # Common rule set
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    override_action {
      none {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "common-rule"
      sampled_requests_enabled   = true
    }
  }

  # SQL Injection protection
  rule {
    name     = "AWS-AWSManagedRulesSQLiRuleSet"
    priority = 2

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    override_action {
      none {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "sqli-rule"
      sampled_requests_enabled   = true
    }
  }

  # Rate limiting rule
  rule {
    name     = "RateLimit"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # IP reputation rule
  rule {
    name     = "AWS-AWSManagedRulesAmazonIpReputationList"
    priority = 4

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }

    override_action {
      none {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "ip-reputation"
      sampled_requests_enabled   = true
    }
  }
}

# AWS Shield Advanced
# resource "aws_shield_protection" "amplify_protection" {
#   name         = "amplify-shield-protection"
#   resource_arn = data.aws_amplify_app.app.arn

#   tags = {
#     Environment = "Production"
#   }
# }

data "aws_amplify_app" "app" {
  app_id = "<YOUR_AMPLIFY_APP_ID>"
}
