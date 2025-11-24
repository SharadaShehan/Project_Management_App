// Cognito Pre-Signup Trigger
// This Lambda is triggered before user signup to validate or modify signup data

export async function handler(event) {
  console.log('Pre-signup event:', JSON.stringify(event, null, 2));
  
  // Auto-confirm user (skip email verification for development)
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  
  // You can add custom validation logic here
  // For example, check if email domain is allowed:
  // const email = event.request.userAttributes.email;
  // if (!email.endsWith('@alloweddomain.com')) {
  //   throw new Error('Invalid email domain');
  // }
  
  return event;
}
