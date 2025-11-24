// Updated App.js with AWS Amplify Configuration
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Amplify } from 'aws-amplify';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import AppNavigator from './src/AppNavigator';
import awsConfig, { validateConfig } from './src/aws-config';
import client from './src/client-appsync';

// Configure AWS Amplify
Amplify.configure(awsConfig);

// Validate configuration on startup
const configValid = validateConfig();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Any initialization logic here
        // For example, check cached credentials
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!configValid) {
          console.warn('AWS configuration needs to be updated with Terraform outputs');
        }
        
        setIsReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
        setIsReady(true); // Still allow app to render
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 8 }}>
          Initialization Error
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <ApolloProvider client={client}>
      <StatusBar style="auto" />
      <AppNavigator />
    </ApolloProvider>
  );
}
