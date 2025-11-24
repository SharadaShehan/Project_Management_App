// User Signup Handler
import { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { putItem, queryGSI1 } from '../shared/dynamodb.js';
import { generateId, isValidEmail, isValidUsername, isValidPassword, validateRequiredFields, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, ValidationError, ConflictError } from '../shared/errors.js';

const cognitoClient = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;

async function signup(event) {
  const { username, password, firstName, lastName, gender, country, primaryEmail, secondaryEmail, imageURL } = event.arguments;
  
  // Validate required fields
  validateRequiredFields({ username, password, firstName, lastName, primaryEmail }, 
    ['username', 'password', 'firstName', 'lastName', 'primaryEmail']);
  
  // Validate formats
  if (!isValidUsername(username)) {
    throw new ValidationError('Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen');
  }
  
  if (!isValidPassword(password)) {
    throw new ValidationError('Password must be 8-30 characters with uppercase, lowercase, number, and special character');
  }
  
  if (!isValidEmail(primaryEmail)) {
    throw new ValidationError('Invalid email format');
  }
  
  if (secondaryEmail && !isValidEmail(secondaryEmail)) {
    throw new ValidationError('Invalid secondary email format');
  }
  
  // Check if username already exists in DynamoDB
  const existingUser = await queryGSI1(`USERNAME#${username.toLowerCase()}`);
  if (existingUser.items.length > 0) {
    throw new ConflictError('Username already exists');
  }
  
  // Create user in Cognito
  try {
    const signUpCommand = new SignUpCommand({
      ClientId: APP_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: primaryEmail },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'custom:country', Value: country || '' },
        { Name: 'custom:gender', Value: gender || '' },
        { Name: 'custom:secondaryEmail', Value: secondaryEmail || '' }
      ]
    });
    
    const signUpResponse = await cognitoClient.send(signUpCommand);
    const userId = signUpResponse.UserSub; // Cognito sub (UUID)
    
    // Auto-confirm user (for development - remove in production)
    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: USER_POOL_ID,
      Username: username
    });
    await cognitoClient.send(confirmCommand);
    
    // Store user in DynamoDB (will also be done by post-confirmation trigger)
    const timestamp = getCurrentTimestamp();
    const wsToken = generateId(); // WebSocket token for subscriptions
    
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
      firstName,
      lastName,
      gender: gender || null,
      country: country || null,
      primaryEmail,
      secondaryEmail: secondaryEmail || null,
      imageURL: imageURL || null,
      wsToken,
      projects: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await putItem(userItem);
    
    // Return user object
    return {
      id: userId,
      username,
      firstName,
      lastName,
      gender,
      country,
      primaryEmail,
      secondaryEmail,
      imageURL,
      wsToken,
      projects: []
    };
    
  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      throw new ConflictError('Username already exists');
    }
    if (error.name === 'InvalidPasswordException') {
      throw new ValidationError('Password does not meet requirements');
    }
    throw error;
  }
}

export const handler = lambdaHandler(signup);
