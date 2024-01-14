// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProjectScreen from './screens/ProjectScreen';
import CreateProjectScreen from './screens/CreateProjectScreen';
import { UserGlobalStateProvider } from './layout/UserState';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <UserGlobalStateProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="Home" component={HomeScreen} 
                        options={{ headerShown: false }}/>
          <Stack.Screen name="Project" component={ProjectScreen}/>
          <Stack.Screen name="CreateProject" component={CreateProjectScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </UserGlobalStateProvider>
  );
};


export default AppNavigator;

