// DetailsScreen.js
import React, { useEffect } from 'react';
import LogOutBtn from '../components/LogOutBtn';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';
import { useQuery, useSubscription } from '@apollo/client';
import { LAST_PHASE_MESSAGES_QUERY, LAST_PRIVATE_MESSAGES_QUERY, LAST_PROJECT_MESSAGES_QUERY } from '../graphql/Queries';
import { NEW_MESSAGE_SUBSCRIPTION } from '../graphql/Subscriptions';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProjectsScreen from './ProjectsScreen';
import ForumScreen from './ForumScreen';
import ProfileScreen from './ProfileScreen';
import MessagesScreen from './MessagesScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const { data: lastPhaseMessagesData, loading: lastPhaseMessagesLoading, error: lastPhaseMessagesError } = useQuery(LAST_PHASE_MESSAGES_QUERY);
  const { data: lastPrivateMessagesData, loading: lastPrivateMessagesLoading, error: lastPrivateMessagesError } = useQuery(LAST_PRIVATE_MESSAGES_QUERY);
  const { data: lastProjectMessagesData, loading: lastProjectMessagesLoading, error: lastProjectMessagesError } = useQuery(LAST_PROJECT_MESSAGES_QUERY);
  const { userData, setUserData } = UserGlobalState();
  const { data: newMessageData, loading: newMessageLoading, error: newMessageError } = useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { wsToken: userData.wsToken },
  });
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
  useEffect(() => {
    if (newMessageData) {
      const newMessage = newMessageData.newMessage;
      if (newMessage.phase) {
        // find whether phase already exists in messagesData
        const phaseIndex = messagesData.findIndex((messageList) => messageList[0] && messageList[0].phase && messageList[0].phase.id === newMessage.phase.id);
        if (phaseIndex === -1) {
          // if phase doesn't exist, add new phase to messagesData
          const newMessagesData = [...messagesData];
          newMessagesData.unshift([newMessage]);
          setMessagesData(newMessagesData);
        } else {
          // if phase exists, add new message to messagesData
          const newMessagesData = [...messagesData];
          newMessagesData[phaseIndex].unshift(newMessage);
          // take only messages with unique id in each list
          newMessagesData[phaseIndex] = newMessagesData[phaseIndex].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
          setMessagesData(newMessagesData);
          console.log(messagesData);
          console.log(phaseIndex);
        }
        console.log("phase message")
      } else if (newMessage.project && !newMessage.phase) {
        // find whether project already exists in messagesData
        const projectIndex = messagesData.findIndex((messageList) => messageList[0] && messageList[0].project && messageList[0].project.id === newMessage.project.id);
        if (projectIndex === -1) {
          // if project doesn't exist, add new project to messagesData
          const newMessagesData = [...messagesData];
          newMessagesData.unshift([newMessage]);
          setMessagesData(newMessagesData);
        } else {
          // if project exists, add new message to messagesData
          const newMessagesData = [...messagesData];
          newMessagesData[projectIndex].unshift(newMessage);
          // take only messages with unique id in each list
          newMessagesData[projectIndex] = newMessagesData[projectIndex].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
          setMessagesData(newMessagesData);
          console.log(messagesData);
          console.log(projectIndex);
        }
        console.log("project message")
      } else if (newMessage.receiver) {
        // find whether sender already exists in messagesData
        const userIndex = messagesData.findIndex((messageList) => messageList[0] && messageList[0].receiver && ((newMessage.receiver.id !== userData.id && (messageList[0].receiver.id === newMessage.receiver.id || messageList[0].sender.id === newMessage.receiver.id)) || (newMessage.sender.id !== userData.id && (messageList[0].receiver.id === newMessage.sender.id || messageList[0].sender.id === newMessage.sender.id))));
        if (userIndex === -1) {
          // if sender doesn't exist, add new sender to messagesData
          const newMessagesData = [...messagesData];
          newMessagesData.unshift([newMessage]);
          setMessagesData(newMessagesData);
        } else {
          // if sender exists, add new message to messagesData
          const newMessagesData = [...messagesData];
          newMessagesData[userIndex].unshift(newMessage);
          // take only messages with unique id in each list
          newMessagesData[userIndex] = newMessagesData[userIndex].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
          setMessagesData(newMessagesData);
          console.log(messagesData);
          console.log(userIndex);
        }
        console.log("private message")
      } else {
        console.log('Invalid message');
      }
    }
  }, [newMessageData]);

  return (
      <Tab.Navigator initialRouteName='Projects'
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: { backgroundColor: '#228B22' },
        }}>
        <Tab.Screen name="Projects" component={ProjectsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MatIcon name="work" size={28} color="white" />
            ),
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            headerStyle: { backgroundColor: '#228B22' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
          }
        }/>

        <Tab.Screen name="Forums" component={ForumScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ color, size }) => (
              <MIcon name="chat-question" size={30} color="white" />
            ),
            headerStyle: { backgroundColor: '#228B22' },
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
              <Icon name="wechat" size={26} color="white" />
            ),
            headerStyle: { backgroundColor: '#228B22' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
          }}
        />

        <Tab.Screen name="Profile" component={ProfileScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ color, size }) => (
              <MatIcon name="account-circle" size={30} color="white" />
            ),
            headerStyle: { backgroundColor: '#228B22' },
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 24, color: '#fff' }
          }}
        />

      </Tab.Navigator>
  )
};

export default HomeScreen;
