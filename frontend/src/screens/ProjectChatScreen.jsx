import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';
import { PROJECT_MESSAGES_QUERY } from '../queries/Queries';
import { CREATE_PROJECT_MESSAGE_MUTATION } from '../queries/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const ProjectChatScreen = ({ navigation, route }) => {
    const flatListRef = useRef(null);
    const [ isBtnDisabled, setIsBtnDisabled ] = useState(false);
    const project = route.params.project;
    const lastMessageIndex = useRef(route.params.lastMessageIndex || 0);
    const limit = route.params.limit || 100;
    const { userData, setUserData } = UserGlobalState();
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const [ textInput, setTextInput ] = useState('');
    var projectindexInMessagesData = messagesData.findIndex((messageList) => messageList[0] && messageList[0].project && messageList[0].project.id === project.id && !messageList[0].phase);

    const { data:recentMessages, loading:messagesLoading, error:messagesError } = useQuery(PROJECT_MESSAGES_QUERY, {
        variables: { projectId: project.id, lastMessageIndex: lastMessageIndex.current, limit: limit },
    })

    const [ createProjectMessage, { data:createdMessage, loading:createdMessageLoading, error:createdMessageError } ] = useMutation(CREATE_PROJECT_MESSAGE_MUTATION);

    useEffect(() => {
        if (recentMessages) {
            const newMessagesData = [...messagesData];
            if (projectindexInMessagesData === -1) {
                projectindexInMessagesData = messagesData.length;
                newMessagesData.push([]);
                setMessagesData(newMessagesData);
                lastMessageIndex.current = 0;
            } else {
                newMessagesData[projectindexInMessagesData].push(...recentMessages.projectMessages);
                // take only messages with unique id in each list
                newMessagesData[projectindexInMessagesData] = newMessagesData[projectindexInMessagesData].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
                setMessagesData(newMessagesData);
                lastMessageIndex.current = newMessagesData[projectindexInMessagesData][newMessagesData[projectindexInMessagesData].length - 1].index;
            }
        }
    }, [recentMessages]);

    const renderItem = ({ item, index }) => {
        const datetimeObj = new Date(parseInt(item.createdAt));
        const convertedDatetime = datetimeObj.toLocaleString()
        const options = { month: 'long', day: 'numeric' };
        const date = datetimeObj.toLocaleDateString('en-US', options);
        const time = convertedDatetime.split(',')[1];
        const timeWithoutSeconds = time.split(':').slice(0, 2).join(':') + ' ' + time.split(' ')[2];
        const isDateSameAsPreviousMessage = index < messagesData[projectindexInMessagesData].length - 1 && new Date(parseInt(messagesData[projectindexInMessagesData][index + 1].createdAt)).toLocaleDateString().split(',')[0] === datetimeObj.toLocaleDateString().split(',')[0];
        const isSameUserAsPreviousMessage = index < messagesData[projectindexInMessagesData].length - 1 && item.sender.id === messagesData[projectindexInMessagesData][index + 1].sender.id;
        const isSenderTheUser = item.sender.id === userData.id;

        return (
            <View>
                {!isDateSameAsPreviousMessage && <Text style={styles.dateText}>{date}</Text>}
                <TouchableOpacity style={[styles.itemContainer, { justifyContent: isSenderTheUser ? 'flex-end' : 'flex-start' }]} key={item.id}>
                    <View style={[styles.fullMessageContainer, { backgroundColor: isSenderTheUser ? '#6BB64a' : '#d8d8d8' }]}>
                        {(!isSameUserAsPreviousMessage && !isSenderTheUser) && <Text style={styles.headerText}>{item.sender.firstName} {item.sender.lastName}</Text>}
                        <View style={[styles.messageContainer, { paddingTop: (!isSameUserAsPreviousMessage && !isSenderTheUser) ? 0 : 5 }]} key={item.id}>
                            <Text style={[styles.messageText, { color: isSenderTheUser ? '#fff' : '#000', paddingBottom: item.content.length > 37 ? 7 : 0 }]}>{item.content}</Text>
                            <Text style={[styles.timeText, { color: isSenderTheUser ? '#ddd' : '#666' }]}> {timeWithoutSeconds}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {messagesLoading && <Text>Loading ...</Text>}
            {messagesError && ( messagesError.status === 401 ? navigation.navigate('Login') : console.log(messagesError.message))}
            {messagesData && (
                <View>
                    <FlatList
                        ref={flatListRef}
                        data={messagesData[projectindexInMessagesData] || []}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        inverted={true}
                        initialScrollIndex={0}
                        initialNumToRender={limit}
                        scrollEventThrottle={16}
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={setTextInput}
                            value={textInput}
                            placeholder="Type a message"
                            multiline={true}
                            editable={!isBtnDisabled}
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={styles.sendBtn}
                            disabled={isBtnDisabled}
                            onPress={async () => {
                                if (textInput.length > 0) {
                                    setIsBtnDisabled(true);
                                    try {
                                        const response = await createProjectMessage({
                                            variables: {
                                                projectId: project.id,
                                                content: textInput,
                                            }
                                        });
                                        console.log(response.data.createProjectMessage);
                                        setTextInput('');
                                    } catch (err) {
                                        console.log(err);
                                    }
                                    setIsBtnDisabled(false);
                                }
                            }}
                        >
                            <MatIcon name="send" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        padding: 5,
        marginTop: 30,
        marginBottom: 10,
        marginHorizontal: 10,
        justifyContent: 'center',
        height: '90%'
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 20,
        marginVertical: 10,
        marginHorizontal: 5,
    },
    textInput: {
        flex: 1,
        padding: 10,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: '#6BB64a',
        borderRadius: 50,
        padding: 10,
        margin: 5,
    },
    itemContainer: {
        paddingTop: 5,
        paddingBottom: 0,
        flexDirection: 'row',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    fullMessageContainer: {
        borderRadius: 10,
        margin: 2,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingTop: 7,
        paddingLeft: 10,
        color: '#228B22',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 5,
        paddingBottom: 0,
        borderRadius: 10,
        margin: 2
    },
    messageText: {
        fontSize: 15,
        color: '#fff',
        maxWidth: '84%',
    },
    timeText: {
        fontSize: 10, 
        lineHeight: 30,
        color: '#ddd',
        verticalAlign: 'bottom',
        paddingBottom: 0
    },
});

export default ProjectChatScreen;
