// Validation Utilities
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

/**
 * Generate a new UUID
 */
export function generateId() {
  return uuidv4();
}

/**
 * Validate UUID format
 */
export function isValidId(id) {
  return validateUUID(id);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username (alphanumeric, underscore, hyphen, 3-30 chars)
 */
export function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password (8-30 chars, at least one uppercase, lowercase, number, special char)
 */
export function isValidPassword(password) {
  if (password.length < 8 || password.length > 30) {
    return false;
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Validate string length
 */
export function isValidLength(str, min, max) {
  if (!str) return false;
  const length = str.length;
  return length >= min && length <= max;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(obj, requiredFields) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!obj[field] || obj[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Validate project status
 */
export function isValidProjectStatus(status) {
  const validStatuses = ['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD'];
  return validStatuses.includes(status);
}

/**
 * Validate task status
 */
export function isValidTaskStatus(status) {
  const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
  return validStatuses.includes(status);
}

/**
 * Validate task priority
 */
export function isValidTaskPriority(priority) {
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  return validPriorities.includes(priority);
}

/**
 * Validate request status
 */
export function isValidRequestStatus(status) {
  const validStatuses = ['PENDING', 'ACCEPTED', 'DECLINED'];
  return validStatuses.includes(status);
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(str) {
  if (!str) return str;
  
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate ISO date string
 */
export function isValidISODate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toISOString() === dateStr;
  } catch {
    return false;
  }
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Validate file type for images
 */
export function isValidImageType(filetype) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(filetype.toLowerCase());
}
