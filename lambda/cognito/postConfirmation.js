// Cognito Post-Confirmation Trigger
// This Lambda is triggered after user confirms their email/signup
// It syncs the user data from Cognito to DynamoDB

import { putItem, queryGSI1 } from '../shared/dynamodb.js';
import { generateId, getCurrentTimestamp } from '../shared/validation.js';

export async function handler(event) {
  console.log('Post-confirmation event:', JSON.stringify(event, null, 2));
  
  const { sub: userId, email, given_name, family_name, 'cognito:username': username } = event.request.userAttributes;
  const customAttrs = event.request.userAttributes;
  
  // Check if user already exists in DynamoDB
  const existingUser = await queryGSI1(`USERNAME#${username.toLowerCase()}`);
  
  if (existingUser.items.length === 0) {
    // User doesn't exist in DynamoDB yet, create entry
    const timestamp = getCurrentTimestamp();
    const wsToken = generateId();
    
    const userItem = {
      PK: `USER#${userId}`,
      SK: 'METADATA',
      GSI1PK: `USERNAME#${username.toLowerCase()}`,
      GSI1SK: 'METADATA',
      GSI3PK: 'USER',
      GSI3SK: timestamp,
      EntityType: 'User',
      id: userId,
      username,
      firstName: given_name || '',
      lastName: family_name || '',
      gender: customAttrs['custom:gender'] || null,
      country: customAttrs['custom:country'] || null,
      primaryEmail: email,
      secondaryEmail: customAttrs['custom:secondaryEmail'] || null,
      imageURL: null,
      wsToken,
      projects: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await putItem(userItem);
    console.log('User synced to DynamoDB:', userId);
  } else {
    console.log('User already exists in DynamoDB:', userId);
  }
  
  return event;
}
