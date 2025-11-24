// S3 Utilities for Image Upload
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});

const PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET;
const PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET;

/**
 * Generate presigned URL for uploading to S3
 */
export async function generatePresignedUploadUrl(filetype, isPublic = false, expiresIn = 300) {
  const bucket = isPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET;
  const key = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: filetype
  });
  
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  
  return {
    uploadUrl: presignedUrl,
    fileUrl: isPublic 
      ? `https://${bucket}.s3.amazonaws.com/${key}`
      : key, // For private files, return just the key
    key
  };
}

/**
 * Get file extension from content type
 */
export function getFileExtension(contentType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  
  return extensions[contentType.toLowerCase()] || 'jpg';
}

/**
 * Generate S3 key with path
 */
export function generateS3Key(prefix, filename) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}/${timestamp}-${random}-${filename}`;
}
