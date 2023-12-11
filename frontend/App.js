import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from './client';
import Basic from './src/basic';
import AppNavigator from './src/AppNavigator';

export default function App() {
  return (
      <ApolloProvider client={client}>
          <AppNavigator />
      </ApolloProvider>
  );
}
