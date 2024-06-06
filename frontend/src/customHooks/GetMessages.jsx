import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { LAST_PHASE_MESSAGES_QUERY, LAST_PRIVATE_MESSAGES_QUERY, LAST_PROJECT_MESSAGES_QUERY } from '../graphql/Queries';
import { MessagesGlobalState } from '../layout/MessagesState';
import { View } from 'react-native';

export const GetMessages = () => {

    const { messagesData, setMessagesData } = MessagesGlobalState();
    
    useEffect(() => {
        const getMessages = async () => {
          const { data: lastPhaseMessagesData, loading: lastPhaseMessagesLoading, error: lastPhaseMessagesError } = useQuery(LAST_PHASE_MESSAGES_QUERY);
          const { data: lastPrivateMessagesData, loading: lastPrivateMessagesLoading, error: lastPrivateMessagesError } = useQuery(LAST_PRIVATE_MESSAGES_QUERY);
          const { data: lastProjectMessagesData, loading: lastProjectMessagesLoading, error: lastProjectMessagesError } = useQuery(LAST_PROJECT_MESSAGES_QUERY);
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
          setMessagesData(messages);
        };
        getMessages();
        console.log(messagesData);
      }, []);

    return
      <View></View>
    
}
