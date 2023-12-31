// DetailsScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import LogOutBtn from '../components/LogOutBtn';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import ProjectsScreen from './ProjectsScreen';
import ForumScreen from './ForumScreen';
import NotificationsScreen from './NotificationsScreen';
import MessagesScreen from './MessagesScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  return (
      <Tab.Navigator initialRouteName='Notifications'>
        <Tab.Screen name="Projects" component={ProjectsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MatIcon name="work" size={28} />
            ),
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
          }
        }/>
          
        <Tab.Screen name="Notifications" component={NotificationsScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ color, size }) => (
              <MatIcon name="notifications" size={30} />
            ),
        }}
        />

        <Tab.Screen name="Forum" component={ForumScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ color, size }) => (
              <MIcon name="chat-question" size={30} />
            ),
          }}
        />

        <Tab.Screen name="Messages" component={MessagesScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ color, size }) => (
              <Icon name="wechat" size={26} />
            ),
          }}
        />
      </Tab.Navigator>
  )
};

export default HomeScreen;
