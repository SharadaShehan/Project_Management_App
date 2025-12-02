// Apollo Client Configuration for AWS AppSync
import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { getMainDefinition } from '@apollo/client/utilities';
import { fetchAuthSession } from 'aws-amplify/auth';
import { legacyConfig as awsConfig } from './aws-config';

// AWS AppSync configuration
const appSyncConfig = {
  url: awsConfig.aws_appsync_graphqlEndpoint,
  region: awsConfig.aws_appsync_region,
  auth: {
    type: awsConfig.aws_appsync_authenticationType,
    jwtToken: async () => {
      try {
        const session = await fetchAuthSession();
        // Use idToken for Cognito User Pools authentication
        const token = session.tokens?.idToken?.toString();
        if (!token) {
          console.log('No token available - user not authenticated');
          return '';
        }
        console.log('Token retrieved for AppSync request');
        return token;
      } catch (error) {
        console.log('Auth session fetch error:', error);
        // User is not authenticated - this is normal for login/signup screens
        return '';
      }
    }
  }
};

// Create AppSync HTTP link
const httpLink = new HttpLink({
  uri: appSyncConfig.url
});

// Create Auth link for AppSync
const authLink = createAuthLink(appSyncConfig);

// Create error link to handle and log errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.log(
        `[GraphQL error]: Message: ${message || 'No message'}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError.message || 'No message'}`);
  }
});

// Create Subscription link for real-time updates
const subscriptionLink = createSubscriptionHandshakeLink(appSyncConfig, httpLink);

// Split link for queries/mutations vs subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  subscriptionLink,
  ApolloLink.from([errorLink, authLink, httpLink])
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure cache policies for lists
          listProjects: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          listProcesses: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          listPhases: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          listTasks: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          listPosts: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          listMessages: {
            merge(existing = [], incoming) {
              return incoming;
            }
          },
          listRequests: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      },
      // Configure normalization for entities
      Project: {
        keyFields: ['id']
      },
      Process: {
        keyFields: ['id']
      },
      Phase: {
        keyFields: ['id']
      },
      Task: {
        keyFields: ['id']
      },
      Post: {
        keyFields: ['id']
      },
      Message: {
        keyFields: ['id']
      },
      Request: {
        keyFields: ['id']
      },
      User: {
        keyFields: ['id']
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});

// Clear cache on initialization (optional)
// client.clearStore();

export default client;
