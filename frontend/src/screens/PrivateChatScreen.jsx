import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';
import { PRIVATE_MESSAGES_QUERY } from '../queries/Queries';
import { CREATE_PRIVATE_MESSAGE_MUTATION } from '../queries/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const PrivateChatScreen = ({ navigation, route }) => {
    const flatListRef = useRef(null);
    const [ isBtnDisabled, setIsBtnDisabled ] = useState(false);
    const user = route.params.user;
    const lastMessageIndex = useRef(route.params.lastMessageIndex || 0);
    const limit = route.params.limit || 100;
    const { userData, setUserData } = UserGlobalState();
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const [ textInput, setTextInput ] = useState('');
    const userindexInMessagesData = messagesData.findIndex((messageList) => messageList[0].receiver && (messageList[0].receiver.id === user.id || messageList[0].sender.id === user.id));

    const { data:recentMessages, loading:messagesLoading, error:messagesError } = useQuery(PRIVATE_MESSAGES_QUERY, {
        variables: { userId: user.id, lastMessageIndex: lastMessageIndex.current, limit: limit },
    })

    const [ createPrivateMessage, { data:createdMessage, loading:createdMessageLoading, error:createdMessageError } ] = useMutation(CREATE_PRIVATE_MESSAGE_MUTATION);

    useEffect(() => {
        if (recentMessages) {
            const newMessagesData = [...messagesData];
            newMessagesData[userindexInMessagesData].push(...recentMessages.privateMessages);
            // take only messages with unique id in each list
            newMessagesData[userindexInMessagesData] = newMessagesData[userindexInMessagesData].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
            setMessagesData(newMessagesData);
            lastMessageIndex.current = newMessagesData[userindexInMessagesData][newMessagesData[userindexInMessagesData].length - 1].index;
        }
    }, [recentMessages]);

    const renderItem = ({ item, index }) => {
        const datetimeObj = new Date(parseInt(item.createdAt));
        const convertedDatetime = datetimeObj.toLocaleString()
        const options = { month: 'long', day: 'numeric' };
        const date = datetimeObj.toLocaleDateString('en-US', options);
        const time = convertedDatetime.split(',')[1];
        const timeWithoutSeconds = time.split(':').slice(0, 2).join(':') + ' ' + time.split(' ')[2];
        const isDateSameAsPreviousMessage = index < messagesData[userindexInMessagesData].length - 1 && new Date(parseInt(messagesData[userindexInMessagesData][index + 1].createdAt)).toLocaleDateString().split(',')[0] === datetimeObj.toLocaleDateString().split(',')[0];
        const isSameUserAsPreviousMessage = index < messagesData[userindexInMessagesData].length - 1 && item.sender.id === messagesData[userindexInMessagesData][index + 1].sender.id;
        const isSenderTheUser = item.sender.id === userData.id;

        return (
            <View>
                {!isDateSameAsPreviousMessage && <Text style={styles.dateText}>{date}</Text>}
                <TouchableOpacity style={[styles.itemContainer, { justifyContent: isSenderTheUser ? 'flex-end' : 'flex-start' }]} key={item.id}>
                    <View style={[styles.fullMessageContainer, { backgroundColor: isSenderTheUser ? '#6BB64a' : '#d8d8d8' }]}>
                        {/* {(!isSameUserAsPreviousMessage && !isSenderTheUser) && <Text style={styles.headerText}>{item.sender.firstName} {item.sender.lastName}</Text>} */}
                        <View style={[styles.messageContainer]} key={item.id}>
                            <Text style={[styles.messageText, { color: isSenderTheUser ? '#fff' : '#000', paddingBottom: item.content.length > 37 ? 7 : 0 }]}>{item.content}</Text>
                            <Text style={[styles.timeText, { color: isSenderTheUser ? '#ddd' : '#666' }]}> {timeWithoutSeconds}</Text>
                            {/* <Text>   {item.index}</Text> */}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={messagesData[userindexInMessagesData] || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                inverted={true}
                initialScrollIndex={0}
                initialNumToRender={limit}
                scrollEventThrottle={16}
                // onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                // onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder='Type a message'
                    onChangeText={(val) => setTextInput(val)}
                    value={textInput}
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
                                const response = await createPrivateMessage({
                                    variables: {
                                        content: textInput,
                                        receiverId: user.id,
                                    }
                                });
                                console.log(response.data.createPrivateMessage);
                                setTextInput('');
                            } catch (err) {
                                console.log(err);
                            }
                            setIsBtnDisabled(false);
                        }
                    }}
                >
                    <MatIcon name='send' size={24} color='#fff' />
                </TouchableOpacity>
            </View>
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
    itemContainer: {
        paddingTop: 5,
        paddingBottom: 0,
        flexDirection: 'row',
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
        color: '#080',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 10,
        
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
});

export default PrivateChatScreen;
