// Authentication and Authorization Utilities
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

/**
 * Extract user ID from Cognito JWT token (AppSync context)
 * AppSync automatically validates the token and provides claims
 */
export function getUserIdFromContext(identity) {
  // Identity object is passed directly from event.identity
  if (!identity || !identity.sub) {
    throw new Error('Unauthorized: No valid user identity found');
  }
  
  return identity.sub; // Cognito sub (UUID)
}

/**
 * Extract username from context
 */
export function getUsernameFromContext(identity) {
  // Identity object is passed directly from event.identity
  if (!identity || !identity.username) {
    throw new Error('Unauthorized: No valid username found');
  }
  
  return identity.username;
}

/**
 * Get user claims from context
 */
export function getUserClaims(identity) {
  // Identity object is passed directly from event.identity
  if (!identity || !identity.claims) {
    throw new Error('Unauthorized: No claims found');
  }
  
  return identity.claims;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(identity) {
  try {
    getUserIdFromContext(identity);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get full user details from Cognito
 */
export async function getCognitoUser(userId) {
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId
  });
  
  const response = await cognitoClient.send(command);
  
  // Parse attributes
  const attributes = {};
  response.UserAttributes.forEach(attr => {
    attributes[attr.Name] = attr.Value;
  });
  
  return {
    userId: response.Username,
    username: attributes['cognito:username'] || attributes['preferred_username'],
    email: attributes.email,
    emailVerified: attributes.email_verified === 'true',
    firstName: attributes.given_name,
    lastName: attributes.family_name,
    country: attributes['custom:country'],
    gender: attributes['custom:gender'],
    secondaryEmail: attributes['custom:secondaryEmail']
  };
}

/**
 * Create AppSync response
 */
export function createResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };
}

/**
 * Create success response
 */
export function successResponse(data) {
  return createResponse(200, data);
}

/**
 * Create error response
 */
export function errorResponse(message, statusCode = 400) {
  return createResponse(statusCode, { error: message });
}

/**
 * Authorization check - verify user owns resource
 */
export function authorizeOwner(userId, resourceOwnerId) {
  if (userId !== resourceOwnerId) {
    throw new Error('Forbidden: You do not have permission to access this resource');
  }
}

/**
 * Authorization check - verify user is project member
 */
export function authorizeProjectMember(userId, projectMembers) {
  if (!projectMembers.includes(userId)) {
    throw new Error('Forbidden: You are not a member of this project');
  }
}
