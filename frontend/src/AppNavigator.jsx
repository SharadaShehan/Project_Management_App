// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProjectScreen from './screens/ProjectScreen';
import CreateProjectScreen from './screens/CreateProjectScreen';
import PhaseChatScreen from './screens/PhaseChatScreen';
import { UserGlobalStateProvider } from './layout/UserState';
import { MessagesGlobalStateProvider } from './layout/MessagesState';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <UserGlobalStateProvider>
    <MessagesGlobalStateProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="Home" component={HomeScreen} 
                        options={{ headerShown: false }}/>
          <Stack.Screen name="Project" component={ProjectScreen}/>
          <Stack.Screen name="CreateProject" component={CreateProjectScreen}/>
          <Stack.Screen name="PhaseChat" component={PhaseChatScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </MessagesGlobalStateProvider>
    </UserGlobalStateProvider>
  );
};


export default AppNavigator;

