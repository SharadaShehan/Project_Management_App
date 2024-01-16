import React, { useEffect, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { PHASE_MESSAGES_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';

const PhaseChatScreen = ({ navigation, route }) => {
    const flatListRef = useRef(null);
    const phase = route.params.phase;
    const lastMessageIndex = useRef(route.params.lastMessageIndex || 0);
    const limit = route.params.limit || 100;
    const { userData, setUserData } = UserGlobalState();
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const phaseindexInMessagesData = messagesData.findIndex((messageList) => messageList[0].phase && messageList[0].phase.id === phase.id);

    const { data:recentMessages, loading:messagesLoading, error:messagesError } = useQuery(PHASE_MESSAGES_QUERY, {
        variables: { phaseId: phase.id, lastMessageIndex: lastMessageIndex.current, limit: limit },
    })

    useEffect(() => {
        if (recentMessages) {
            const newMessagesData = [...messagesData];
            newMessagesData[phaseindexInMessagesData].push(...recentMessages.phaseMessages);
            // take only messages with unique id in each list
            newMessagesData[phaseindexInMessagesData] = newMessagesData[phaseindexInMessagesData].filter((message, index, self) => self.findIndex((m) => m.id === message.id) === index);
            setMessagesData(newMessagesData);
            console.log(messagesData);
            console.log("index : ", newMessagesData[phaseindexInMessagesData][newMessagesData[phaseindexInMessagesData].length - 1].index )
            lastMessageIndex.current = newMessagesData[phaseindexInMessagesData][newMessagesData[phaseindexInMessagesData].length - 1].index;
            console.log(lastMessageIndex.current);
        }
    }, [recentMessages]);

    const renderItem = ({ item, index }) => {
        const datetimeObj = new Date(parseInt(item.createdAt));
        const convertedDatetime = datetimeObj.toLocaleString()
        const date = convertedDatetime.split(',')[0];
        const time = convertedDatetime.split(',')[1];
        const timeWithoutSeconds = time.split(':').slice(0, 2).join(':') + ' ' + time.split(' ')[2];
        const isDateSameAsPreviousMessage = index < messagesData[phaseindexInMessagesData].length - 1 && new Date(parseInt(messagesData[phaseindexInMessagesData][index + 1].createdAt)).toLocaleDateString().split(',')[0] === datetimeObj.toLocaleDateString().split(',')[0];
        const isSameUserAsPreviousMessage = index < messagesData[phaseindexInMessagesData].length - 1 && item.sender.id === messagesData[phaseindexInMessagesData][index + 1].sender.id;
        const isSenderTheUser = item.sender.id === userData.id;

        return (
        <View>
            {!isDateSameAsPreviousMessage && <Text style={styles.dateText}>{date}</Text>}
            {(!isSameUserAsPreviousMessage && !isSenderTheUser) && <Text style={styles.headerText}>{item.sender.firstName} {item.sender.lastName}</Text>}
            <TouchableOpacity style={[styles.itemContainer, { justifyContent: isSenderTheUser ? 'flex-end' : 'flex-start' }]} key={item.id}>
                    <View style={[styles.messageContainer, { backgroundColor: isSenderTheUser ? '#6BB64a' : '#434343' }]}>
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={styles.timeText}> {timeWithoutSeconds}</Text>
                        {/* <Text>   {item.index}</Text> */}
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
                        scrollEventThrottle={100} // Adjust the throttle as needed
                    />
                    <View>
                        <Text>send new message</Text>
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
        margin: 20,
        // alignItems: 'center',
        justifyContent: 'center',
        height: '90%',
    },
    itemContainer: {
        paddingTop: 5,
        paddingBottom: 0,
        // borderBottomColor: 'black',
        // borderBottomWidth: 1,
        flexDirection: 'row',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center',
        margin: 10,
        // backgroundColor: '#434343',
        padding: 5,
        
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#6BB64a',
        paddingHorizontal: 10,
        paddingTop: 6,
        paddingBottom: 0,
        borderRadius: 10,
        margin: 2,

    },
    messageText: {
        fontSize: 15,
        color: '#fff',
    },
    timeText: { 
        fontSize: 10, 
        lineHeight: 30,
        color: '#eee',
    }
});

export default PhaseChatScreen;
