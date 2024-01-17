import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';
import { PHASE_MESSAGES_QUERY } from '../queries/Queries';
import { CREATE_PHASE_MESSAGE_MUTATION } from '../queries/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const PhaseChatScreen = ({ navigation, route }) => {
    const flatListRef = useRef(null);
    const [ isBtnDisabled, setIsBtnDisabled ] = useState(false);
    const phase = route.params.phase;
    const lastMessageIndex = useRef(route.params.lastMessageIndex || 0);
    const limit = route.params.limit || 100;
    const { userData, setUserData } = UserGlobalState();
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const [ textInput, setTextInput ] = useState('');
    const phaseindexInMessagesData = messagesData.findIndex((messageList) => messageList[0].phase && messageList[0].phase.id === phase.id);

    const { data:recentMessages, loading:messagesLoading, error:messagesError } = useQuery(PHASE_MESSAGES_QUERY, {
        variables: { phaseId: phase.id, lastMessageIndex: lastMessageIndex.current, limit: limit },
    })

    const [ createPhaseMessage, { data:createdMessage, loading:createdMessageLoading, error:createdMessageError } ] = useMutation(CREATE_PHASE_MESSAGE_MUTATION);

    useEffect(() => {
        if (recentMessages) {
            const newMessagesData = [...messagesData];
            newMessagesData[phaseindexInMessagesData].push(...recentMessages.phaseMessages);
            // take only messages with unique id in each list
            newMessagesData[phaseindexInMessagesData] = newMessagesData[phaseindexInMessagesData].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
            setMessagesData(newMessagesData);
            lastMessageIndex.current = newMessagesData[phaseindexInMessagesData][newMessagesData[phaseindexInMessagesData].length - 1].index;
        }
    }, [recentMessages]);

    const renderItem = ({ item, index }) => {
        const datetimeObj = new Date(parseInt(item.createdAt));
        const convertedDatetime = datetimeObj.toLocaleString()
        const options = { month: 'long', day: 'numeric' };
        const date = datetimeObj.toLocaleDateString('en-US', options);
        const time = convertedDatetime.split(',')[1];
        const timeWithoutSeconds = time.split(':').slice(0, 2).join(':') + ' ' + time.split(' ')[2];
        const isDateSameAsPreviousMessage = index < messagesData[phaseindexInMessagesData].length - 1 && new Date(parseInt(messagesData[phaseindexInMessagesData][index + 1].createdAt)).toLocaleDateString().split(',')[0] === datetimeObj.toLocaleDateString().split(',')[0];
        const isSameUserAsPreviousMessage = index < messagesData[phaseindexInMessagesData].length - 1 && item.sender.id === messagesData[phaseindexInMessagesData][index + 1].sender.id;
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
                            {/* <Text>   {item.index}</Text> */}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {messagesLoading && <Text>Loading ...</Text>}
            {messagesError && ( messagesError.status === 401 ? navigation.navigate('Login') : console.log(messagesError.message))}
            {messagesData && (
                <View>
                    <FlatList
                        ref={flatListRef}
                        data={messagesData[phaseindexInMessagesData] || []}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        inverted={true}  // Reverse the order of rendering
                        initialScrollIndex={0}  // Scroll to the bottom
                        // initialNumToRender={messagesData[phaseindexInMessagesData].length}  // Render all messages
                        initialNumToRender={limit}
                        // onScroll={handleScroll}
                        scrollEventThrottle={16} // Adjust the throttle as needed
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            multiline
                            placeholder='Type a message ...'
                            style={[styles.textInput]}
                            numberOfLines={Math.floor(textInput.length / 25)+1}
                            value={textInput}
                            onChangeText={(text) => setTextInput(text)}
                            // textAlignVertical='top'
                        />
                        <TouchableOpacity
                            style={styles.sendBtn}
                            onPress={async () => {
                                if (textInput.length > 0) {
                                    setIsBtnDisabled(true);
                                    try {
                                        const response = await createPhaseMessage({
                                            variables: {
                                                phaseId: phase.id,
                                                content: textInput,
                                            }
                                        });
                                        console.log(response.data.createPhaseMessage);
                                        setTextInput('');
                                    } catch (err) {
                                        console.log(err);
                                    }
                                    setIsBtnDisabled(false);
                                }
                            }}
                            disabled={isBtnDisabled}
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

export default PhaseChatScreen;
