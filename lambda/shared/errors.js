// Error Handling Utilities

/**
 * Standard error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Internal server error
 */
export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
    this.name = 'InternalError';
  }
}

/**
 * Lambda handler wrapper with error handling
 */
export function lambdaHandler(handler) {
  return async (event, context) => {
    try {
      console.log('Event:', JSON.stringify(event, null, 2));
      
      const result = await handler(event, context);
      
      console.log('Result:', JSON.stringify(result, null, 2));
      return result;
      
    } catch (error) {
      console.error('Error:', error);
      
      // Handle known application errors
      if (error instanceof AppError) {
        throw new Error(JSON.stringify({
          message: error.message,
          code: error.code,
          statusCode: error.statusCode
        }));
      }
      
      // Handle DynamoDB errors
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error(JSON.stringify({
          message: 'Conditional check failed',
          code: 'CONDITIONAL_CHECK_FAILED',
          statusCode: 409
        }));
      }
      
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(JSON.stringify({
          message: 'Resource not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }));
      }
      
      // Handle AWS SDK errors
      if (error.$metadata) {
        throw new Error(JSON.stringify({
          message: error.message || 'AWS service error',
          code: 'AWS_ERROR',
          statusCode: error.$metadata.httpStatusCode || 500
        }));
      }
      
      // Handle unknown errors
      throw new Error(JSON.stringify({
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }));
    }
  };
}

/**
 * Parse AppSync event
 */
export function parseAppSyncEvent(event) {
  return {
    arguments: event.arguments || {},
    identity: event.identity || {},
    source: event.source || {},
    request: event.request || {},
    info: event.info || {}
  };
}

/**
 * Log helper
 */
export function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...data
  };
  
  console.log(JSON.stringify(logEntry));
}
