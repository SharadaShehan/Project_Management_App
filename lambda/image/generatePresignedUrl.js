// Generate Presigned URL for S3 Upload
import { generatePresignedUploadUrl } from '../shared/s3.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, ValidationError } from '../shared/errors.js';
import { isValidImageType } from '../shared/validation.js';

async function generatePresignedUrl(event) {
  const { filetype } = event.arguments;
  
  // Verify user is authenticated
  getUserIdFromContext(event.identity);
  
  // Validate file type
  if (!isValidImageType(filetype)) {
    throw new ValidationError('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed');
  }
  
  // Generate presigned URL (300 seconds expiry)
  const result = await generatePresignedUploadUrl(filetype, false, 300);
  
  // Return the presigned URL
  return result.uploadUrl;
}

export const handler = lambdaHandler(generatePresignedUrl);
