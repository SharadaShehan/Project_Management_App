// AWS Amplify Configuration for Project Management App
// This file should be generated after Terraform deployment

const awsConfig = {
  // AWS Region
  aws_project_region: process.env.AWS_REGION || 'us-east-1',
  
  // AWS Cognito Configuration
  Auth: {
    region: process.env.AWS_REGION || 'us-east-1',
    userPoolId: process.env.COGNITO_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
    userPoolWebClientId: process.env.COGNITO_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || 'us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    mandatorySignIn: true,
    
    // Cognito hosted UI configuration (optional)
    oauth: {
      domain: process.env.COGNITO_DOMAIN || 'your-app-domain.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      redirectSignIn: 'exp://localhost:8081/',
      redirectSignOut: 'exp://localhost:8081/',
      responseType: 'code'
    }
  },
  
  // AWS AppSync Configuration
  aws_appsync_graphqlEndpoint: process.env.APPSYNC_ENDPOINT || 'https://XXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: process.env.AWS_REGION || 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  
  // S3 Storage Configuration
  Storage: {
    AWSS3: {
      bucket: process.env.S3_BUCKET || 'project-management-app-bucket',
      region: process.env.AWS_REGION || 'us-east-1'
    }
  }
};

export default awsConfig;

// For environment-specific configurations
export const getConfig = (environment = 'development') => {
  const configs = {
    development: {
      ...awsConfig,
      // Override with dev-specific values
    },
    staging: {
      ...awsConfig,
      // Override with staging-specific values
    },
    production: {
      ...awsConfig,
      // Override with production-specific values
    }
  };
  
  return configs[environment] || configs.development;
};

// Helper to check if config is properly set
export const validateConfig = () => {
  const required = [
    awsConfig.Auth.userPoolId,
    awsConfig.Auth.userPoolWebClientId,
    awsConfig.aws_appsync_graphqlEndpoint
  ];
  
  const hasPlaceholders = required.some(val => 
    val.includes('XXXX') || val.includes('your-app')
  );
  
  if (hasPlaceholders) {
    console.warn('⚠️  AWS configuration contains placeholder values. Please update with actual values from Terraform output.');
    return false;
  }
  
  console.log('✅ AWS configuration validated successfully');
  return true;
};
