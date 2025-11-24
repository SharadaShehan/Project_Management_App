// Update User Profile Handler
import { updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, ValidationError } from '../shared/errors.js';
import { isValidEmail, validateRequiredFields, getCurrentTimestamp } from '../shared/validation.js';

async function updateProfile(event) {
  const { firstName, lastName, gender, country, primaryEmail, secondaryEmail, imageURL } = event.arguments;
  
  // Get authenticated user ID
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ firstName, lastName, primaryEmail }, ['firstName', 'lastName', 'primaryEmail']);
  
  // Validate email formats
  if (!isValidEmail(primaryEmail)) {
    throw new ValidationError('Invalid primary email format');
  }
  
  if (secondaryEmail && !isValidEmail(secondaryEmail)) {
    throw new ValidationError('Invalid secondary email format');
  }
  
  // Prepare updates
  const updates = {
    firstName,
    lastName,
    gender: gender || null,
    country: country || null,
    primaryEmail,
    secondaryEmail: secondaryEmail || null,
    imageURL: imageURL || null,
    updatedAt: getCurrentTimestamp()
  };
  
  // Update DynamoDB
  const updatedUser = await updateItem(`USER#${userId}`, 'METADATA', updates);
  
  // Return updated profile
  return {
    id: updatedUser.id,
    username: updatedUser.username,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    gender: updatedUser.gender,
    country: updatedUser.country,
    primaryEmail: updatedUser.primaryEmail,
    secondaryEmail: updatedUser.secondaryEmail,
    imageURL: updatedUser.imageURL,
    wsToken: updatedUser.wsToken,
    projects: updatedUser.projects || []
  };
}

export const handler = lambdaHandler(updateProfile);
