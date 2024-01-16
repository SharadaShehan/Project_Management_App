import React from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { PHASE_MESSAGES_QUERY, PROJECT_MESSAGES_QUERY, PRIVATE_MESSAGES_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';

const ChatScreen = ({ navigation, route }) => {
    const mLimit = 10;
    const phase = route.params.phase;
    const project = route.params.project;
    const sender = route.params.sender;
    let lastMessageIndex = route.params.lastMessageIndex || 0;
    let messagesData = null;
    let messagesLoading = null;
    let messagesError = null;

    if (phase) {
        const { data:messagesData, loading:messagesLoading, error:messagesError } = useQuery(PHASE_MESSAGES_QUERY, {
            variables: { phaseId: phase.id, index: lastMessageIndex, limit: mLimit },
        })
        // MessagesData = phaseMessageData.phaseMessages;
        // MessagesLoading = phaseMessageLoading;
        // MessagesError = phaseMessageError;
    } else if (project) {
        const { data:messagesData, loading:messagesLoading, error:messagesError } = useQuery(PROJECT_MESSAGES_QUERY, {
            variables: { projectId: project.id, index: lastMessageIndex, limit: mLimit },
        })
        // MessagesData = projectMessageData.projectMessages;
        // MessagesLoading = projectMessageLoading;
        // MessagesError = projectMessageError;
    } else if (sender) {
        const { data:messagesData, loading:messagesLoading, error:messagesError } = useQuery(PRIVATE_MESSAGES_QUERY, {
            variables: { senderId: sender.id, index: lastMessageIndex, limit: mLimit },
        })
        // MessagesData = privateMessageData.privateMessages;
        // MessagesLoading = privateMessageLoading;
        // MessagesError = privateMessageError;
    } else {
        return (
            <View>
                <Text>Chat Screen</Text>
                <Text>Invalid Route</Text>
            </View>
        );
    }

    return (
        <View>
            {messagesLoading && <Text>Loading ...</Text>}
            {messagesError && ( MessagesError.status === 401 ? navigation.navigate('Login') : console.log(MessagesError.message))}
            {messagesData && (
                <View>
                    <Text>Chat Screen</Text>
                    <Text>Messages</Text>
                    <FlatList
                        data={MessagesData.phaseMessages || MessagesData.projectMessages || MessagesData.privateMessages}
                        renderItem={({ item }) => (
                            <View>
                                <Text>{item.sender.firstName} {item.sender.lastName} : {item.content}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
            )}
        </View>
    );
}

export default ChatScreen;
