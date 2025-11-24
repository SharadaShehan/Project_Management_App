// User Login Handler
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { getItem } from '../shared/dynamodb.js';
import { lambdaHandler, AuthenticationError, NotFoundError, ValidationError } from '../shared/errors.js';
import { validateRequiredFields } from '../shared/validation.js';

const cognitoClient = new CognitoIdentityProviderClient({});
const APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;

async function login(event) {
  const { username, password } = event.arguments;
  
  // Validate required fields
  validateRequiredFields({ username, password }, ['username', 'password']);
  
  try {
    // Authenticate with Cognito
    const authCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: APP_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    });
    
    const authResponse = await cognitoClient.send(authCommand);
    
    if (!authResponse.AuthenticationResult) {
      throw new AuthenticationError('Authentication failed');
    }
    
    const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;
    
    // Decode ID token to get user sub
    const tokenPayload = JSON.parse(
      Buffer.from(IdToken.split('.')[1], 'base64').toString()
    );
    const userId = tokenPayload.sub;
    
    // Get user data from DynamoDB
    const userItem = await getItem(`USER#${userId}`, 'METADATA');
    
    if (!userItem) {
      throw new NotFoundError('User');
    }
    
    // Return user data with tokens
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
      projects: userItem.projects || [],
      // Tokens (for client to store)
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken
    };
    
  } catch (error) {
    if (error.name === 'NotAuthorizedException') {
      throw new AuthenticationError('Invalid username or password');
    }
    if (error.name === 'UserNotFoundException') {
      throw new AuthenticationError('Invalid username or password');
    }
    if (error.name === 'UserNotConfirmedException') {
      throw new AuthenticationError('User email not verified');
    }
    throw error;
  }
}

export const handler = lambdaHandler(login);
