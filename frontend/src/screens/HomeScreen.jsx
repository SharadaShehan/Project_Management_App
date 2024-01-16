// DetailsScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import LogOutBtn from '../components/LogOutBtn';
import { MessagesGlobalState } from '../layout/MessagesState';
import { useQuery } from '@apollo/client';
import { LAST_PHASE_MESSAGES_QUERY, LAST_PRIVATE_MESSAGES_QUERY, LAST_PROJECT_MESSAGES_QUERY } from '../queries/Queries';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import ProjectsScreen from './ProjectsScreen';
import ForumScreen from './ForumScreen';
import NotificationsScreen from './NotificationsScreen';
import MessagesScreen from './MessagesScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { GetMessages } from '../customHooks/GetMessages';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const { data: lastPhaseMessagesData, loading: lastPhaseMessagesLoading, error: lastPhaseMessagesError } = useQuery(LAST_PHASE_MESSAGES_QUERY);
  const { data: lastPrivateMessagesData, loading: lastPrivateMessagesLoading, error: lastPrivateMessagesError } = useQuery(LAST_PRIVATE_MESSAGES_QUERY);
  const { data: lastProjectMessagesData, loading: lastProjectMessagesLoading, error: lastProjectMessagesError } = useQuery(LAST_PROJECT_MESSAGES_QUERY);
  const { messagesData, setMessagesData } = MessagesGlobalState();
  const messages = [];
  if (lastPhaseMessagesData) {
    lastPhaseMessagesData.lastPhaseMessages.map((message) => {
      messages.push(message);
    });
  }
  if (lastPrivateMessagesData) {
    lastPrivateMessagesData.lastPrivateMessages.map((message) => {
      messages.push(message);
    });
  }
  if (lastProjectMessagesData) {
    lastProjectMessagesData.lastProjectMessages.map((message) => {
      messages.push(message);
    });
  }
  useEffect(() => {
    messages.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    const nestedMessages = [];
    messages.map((message) => {
      nestedMessages.push([message]);
    });
    setMessagesData(nestedMessages);
  }, []);

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
            headerStyle: { backgroundColor: '#6BB64a' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
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
            headerStyle: { backgroundColor: '#6BB64a' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
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
            headerStyle: { backgroundColor: '#6BB64a' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
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
            headerStyle: { backgroundColor: '#6BB64a' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
          }}
        />

      </Tab.Navigator>
  )
};

export default HomeScreen;
