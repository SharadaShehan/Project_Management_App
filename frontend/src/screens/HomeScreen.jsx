import React, { useEffect } from 'react';
import LogOutBtn from '../components/LogOutBtn';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';
import { useQuery, useSubscription } from '@apollo/client';
import { LAST_PHASE_MESSAGES_QUERY, LAST_PRIVATE_MESSAGES_QUERY, LAST_PROJECT_MESSAGES_QUERY } from '../graphql/Queries';
import { NEW_PRIVATE_MESSAGE_SUBSCRIPTION, NEW_PROJECT_MESSAGE_SUBSCRIPTION, NEW_PHASE_MESSAGE_SUBSCRIPTION } from '../graphql/Subscriptions';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProjectsScreen from './Project/ProjectsScreen';
import ForumScreen from './Forum/ForumScreen';
import ProfileScreen from './Profile/ProfileScreen';
import MessagesScreen from './Chat/MessagesScreen';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  // Skip these queries for now - resolvers not yet configured
  const { data: lastPhaseMessagesData, loading: lastPhaseMessagesLoading, error: lastPhaseMessagesError } = useQuery(LAST_PHASE_MESSAGES_QUERY, { skip: true });
  const { data: lastPrivateMessagesData, loading: lastPrivateMessagesLoading, error: lastPrivateMessagesError } = useQuery(LAST_PRIVATE_MESSAGES_QUERY, { skip: true });
  const { data: lastProjectMessagesData, loading: lastProjectMessagesLoading, error: lastProjectMessagesError } = useQuery(LAST_PROJECT_MESSAGES_QUERY, { skip: true });
  const { userData, setUserData } = UserGlobalState();
  
  // Subscribe to all three message types
  const { data: newPrivateMessageData } = useSubscription(NEW_PRIVATE_MESSAGE_SUBSCRIPTION, {
    variables: { wsToken: userData?.wsToken || '' },
    skip: !userData?.wsToken,
  });
  const { data: newProjectMessageData } = useSubscription(NEW_PROJECT_MESSAGE_SUBSCRIPTION, {
    variables: { wsToken: userData?.wsToken || '' },
    skip: !userData?.wsToken,
  });
  const { data: newPhaseMessageData } = useSubscription(NEW_PHASE_MESSAGE_SUBSCRIPTION, {
    variables: { wsToken: userData?.wsToken || '' },
    skip: !userData?.wsToken,
  });
  
  const { messagesData, setMessagesData } = MessagesGlobalState();
  const messages = [];
  if (lastPhaseMessagesData && lastPhaseMessagesData.lastPhaseMessages) {
    lastPhaseMessagesData.lastPhaseMessages.map((message) => {
      messages.push(message);
    });
  }
  if (lastPrivateMessagesData && lastPrivateMessagesData.lastPrivateMessages) {
    lastPrivateMessagesData.lastPrivateMessages.map((message) => {
      messages.push(message);
    });
  }
  if (lastProjectMessagesData && lastProjectMessagesData.lastProjectMessages) {
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
  
  // Handle new messages from all subscription types
  useEffect(() => {
    let newMessage = null;
    
    if (newPhaseMessageData) {
      newMessage = newPhaseMessageData.onNewPhaseMessage;
    } else if (newProjectMessageData) {
      newMessage = newProjectMessageData.onNewProjectMessage;
    } else if (newPrivateMessageData) {
      newMessage = newPrivateMessageData.onNewPrivateMessage;
    }
    
    if (newMessage) {
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
  }, [newPrivateMessageData, newProjectMessageData, newPhaseMessageData]);

  return (
      <Tab.Navigator initialRouteName='Projects'
        screenOptions={{
          tabBarActiveTintColor: colors.text.inverse,
          tabBarInactiveTintColor: colors.neutral[300],
          tabBarStyle: { 
            backgroundColor: colors.primary.main,
            borderTopWidth: 0,
            elevation: 8,
            shadowOpacity: 0.1,
          },
        }}>
        <Tab.Screen name="Projects" component={ProjectsScreen} 
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons 
                name="work" 
                size={28} 
                color={focused ? colors.text.inverse : colors.neutral[300]} 
              />
            ),
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            headerStyle: { 
              backgroundColor: colors.primary.main,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: { 
              fontSize: typography.fontSize['2xl'], 
              color: colors.text.inverse,
              fontWeight: typography.fontWeight.bold,
            }
          }
        }/>

        <Tab.Screen name="Forums" component={ForumScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons 
                name="chat-question" 
                size={30} 
                color={focused ? colors.text.inverse : colors.neutral[300]} 
              />
            ),
            headerStyle: { 
              backgroundColor: colors.primary.main,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: { 
              fontSize: typography.fontSize['2xl'], 
              color: colors.text.inverse,
              fontWeight: typography.fontWeight.bold,
            }
          }}
        />

        <Tab.Screen name="Messages" component={MessagesScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ focused }) => (
              <FontAwesome 
                name="wechat" 
                size={26} 
                color={focused ? colors.text.inverse : colors.neutral[300]} 
              />
            ),
            headerStyle: { 
              backgroundColor: colors.primary.main,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: { 
              fontSize: typography.fontSize['2xl'], 
              color: colors.text.inverse,
              fontWeight: typography.fontWeight.bold,
            }
          }}
        />

        <Tab.Screen name="Profile" component={ProfileScreen} 
          options={{
            headerRight: () => (
              <LogOutBtn navigation={navigation} />
            ),
            tabBarIcon: ({ focused }) => (
              <MaterialIcons 
                name="account-circle" 
                size={30} 
                color={focused ? colors.text.inverse : colors.neutral[300]} 
              />
            ),
            headerStyle: { 
              backgroundColor: colors.primary.main,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: { 
              fontSize: typography.fontSize['2xl'], 
              color: colors.text.inverse,
              fontWeight: typography.fontWeight.bold,
            }
          }}
        />

      </Tab.Navigator>
  )
};

export default HomeScreen;
