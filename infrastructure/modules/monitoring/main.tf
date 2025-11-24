# Monitoring Module - CloudWatch Logs, Alarms, and Dashboard

# CloudWatch Log Group for AppSync
resource "aws_cloudwatch_log_group" "appsync" {
  name              = "/aws/appsync/apis/${var.appsync_api_id}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-appsync-logs"
  }
}

# CloudWatch Log Group for Lambda Functions (generic)
resource "aws_cloudwatch_log_group" "lambda" {
  for_each = toset(var.lambda_function_names)

  name              = "/aws/lambda/${each.value}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.value}-logs"
  }
}

# CloudWatch Alarm - DynamoDB Read Throttles
resource "aws_cloudwatch_metric_alarm" "dynamodb_read_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-read-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReadThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "This metric monitors DynamoDB read throttle events"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-dynamodb-read-throttles"
  }
}

# CloudWatch Alarm - DynamoDB Write Throttles
resource "aws_cloudwatch_metric_alarm" "dynamodb_write_throttles" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-write-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "WriteThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "This metric monitors DynamoDB write throttle events"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-dynamodb-write-throttles"
  }
}

# CloudWatch Alarm - Lambda Errors
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = toset(var.lambda_function_names)

  alarm_name          = "${var.project_name}-${var.environment}-${each.value}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "This metric monitors Lambda function errors for ${each.value}"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = each.value
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.value}-errors"
  }
}

# CloudWatch Alarm - AppSync 4XX Errors
resource "aws_cloudwatch_metric_alarm" "appsync_4xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-appsync-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4XXError"
  namespace           = "AWS/AppSync"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "This metric monitors AppSync 4XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    GraphQLAPIId = var.appsync_api_id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-appsync-4xx-errors"
  }
}

# CloudWatch Alarm - AppSync 5XX Errors
resource "aws_cloudwatch_metric_alarm" "appsync_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-appsync-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/AppSync"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "This metric monitors AppSync 5XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    GraphQLAPIId = var.appsync_api_id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-appsync-5xx-errors"
  }
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"

  tags = {
    Name = "${var.project_name}-${var.environment}-alerts"
  }
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/AppSync", "4XXError", { stat = "Sum", label = "4XX Errors" }],
            [".", "5XXError", { stat = "Sum", label = "5XX Errors" }],
            [".", "Latency", { stat = "Average", label = "Latency" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "AppSync Metrics"
          dimensions = {
            GraphQLAPIId = var.appsync_api_id
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", { stat = "Sum" }],
            [".", "ConsumedWriteCapacityUnits", { stat = "Sum" }],
            [".", "UserErrors", { stat = "Sum" }],
            [".", "SystemErrors", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "DynamoDB Metrics"
          dimensions = {
            TableName = var.dynamodb_table_name
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum" }],
            [".", "Errors", { stat = "Sum" }],
            [".", "Duration", { stat = "Average" }],
            [".", "Throttles", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Lambda Metrics (Aggregate)"
        }
      },
      {
        type = "log"
        properties = {
          query   = "SOURCE '/aws/appsync/apis/${var.appsync_api_id}' | fields @timestamp, @message | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent AppSync Logs"
        }
      }
    ]
  })
}
