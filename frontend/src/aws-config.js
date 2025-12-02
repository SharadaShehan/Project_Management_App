const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_xQfK2kPMZ',
      userPoolClientId: '3svkip6alt129chko4ukssvq2e',
      region: 'us-east-1',
      loginWith: {
        username: true,
        email: true
      }
    }
  }
};

// Legacy format for backwards compatibility with AppSync client
export const legacyConfig = {
  aws_project_region: 'us-east-1',
  aws_appsync_graphqlEndpoint: 'https://lzovifimxndvnnpk7q7iqnwjzu.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS'
};

export default awsConfig;
