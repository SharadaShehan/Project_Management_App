# S3 Module Outputs

output "private_bucket_name" {
  description = "Name of the private S3 bucket"
  value       = aws_s3_bucket.private.id
}

output "private_bucket_arn" {
  description = "ARN of the private S3 bucket"
  value       = aws_s3_bucket.private.arn
}

output "private_bucket_domain" {
  description = "Domain name of the private S3 bucket"
  value       = aws_s3_bucket.private.bucket_domain_name
}

output "public_bucket_name" {
  description = "Name of the public S3 bucket"
  value       = aws_s3_bucket.public.id
}

output "public_bucket_arn" {
  description = "ARN of the public S3 bucket"
  value       = aws_s3_bucket.public.arn
}

output "public_bucket_domain" {
  description = "Domain name of the public S3 bucket"
  value       = aws_s3_bucket.public.bucket_domain_name
}

output "public_bucket_url" {
  description = "Public URL of the public S3 bucket"
  value       = "https://${aws_s3_bucket.public.bucket_domain_name}"
}
