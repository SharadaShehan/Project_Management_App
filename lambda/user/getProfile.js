// Get User Profile Handler
import { getItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError } from '../shared/errors.js';

async function getProfile(event) {
  // Get authenticated user ID from context
  const userId = getUserIdFromContext(event.identity);
  
  // Get user from DynamoDB
  const userItem = await getItem(`USER#${userId}`, 'METADATA');
  
  if (!userItem) {
    throw new NotFoundError('User');
  }
  
  // Return user profile
  return {
    id: userItem.id,
    username: userItem.username,
    firstName: userItem.firstName,
    lastName: userItem.lastName,
    gender: userItem.gender,
    country: userItem.country,
    primaryEmail: userItem.primaryEmail,
    secondaryEmail: userItem.secondaryEmail,
    imageURL: userItem.imageURL,
    wsToken: userItem.wsToken,
    projects: userItem.projects || []
  };
}

export const handler = lambdaHandler(getProfile);
