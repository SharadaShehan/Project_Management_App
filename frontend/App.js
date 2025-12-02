import 'react-native-get-random-values';
import { Amplify } from 'aws-amplify';
import awsConfig from './src/aws-config';

// Configure Amplify FIRST before any other imports
Amplify.configure(awsConfig);

import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from './src/client-appsync';
import AppNavigator from './src/AppNavigator';

export default function App() {
  return (
      <ApolloProvider client={client}>
          <AppNavigator />
      </ApolloProvider>
  );
}
