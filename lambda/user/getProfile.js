// Get User Profile Handler
import { getItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError } from '../shared/errors.js';

async function getProfile(event) {
  // Log the entire event for debugging
  console.log('GetProfile event:', JSON.stringify(event, null, 2));
  console.log('Event identity:', JSON.stringify(event.identity, null, 2));
  
  // Get authenticated user ID from context
  const userId = getUserIdFromContext(event.identity);
  
  console.log('Extracted userId:', userId);
  
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
