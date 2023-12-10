import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from './client';
import Basic from './src/Basic'

export default function App() {
  return (
      <ApolloProvider client={client}>
        <View style={styles.container}>
          <Basic />
          <StatusBar style="auto" />
        </View>
      </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
