import React, { useEffect, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { PHASE_MESSAGES_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';
import { MessagesGlobalState } from '../layout/MessagesState';

const PhaseChatScreen = ({ navigation, route }) => {
    const flatListRef = useRef(null);
    const phase = route.params.phase;
    const lastMessageIndex = useRef(route.params.lastMessageIndex || 0);
    const limit = route.params.limit || 100;
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

    // Function to be triggered when scrolled to the top
    // const handleScrollToTop = () => {
    //     console.log('Scrolled to the top!');
    // };

    // // Event handler for the onScroll event
    // const handleScroll = (event) => {
    //     const { x, y, width, height } = event.nativeEvent.layoutMeasurement;
    //     console.log(x, y, width, height);
    //     const offsetY = event.nativeEvent.contentOffset.y;
    //     console.log(offsetY);
    //     if (offsetY === 0) {
    //     // Scrolled to the top
    //     handleScrollToTop();
    //     }
    // };

    const renderItem = ({ item, index }) => {
        const dateObj = new Date(parseInt(item.createdAt));
        const convertedDate = dateObj.toLocaleString().replace(',', '');
        const isSameUserAsPreviousMessage = index < messagesData[phaseindexInMessagesData].length - 1 && item.sender.id === messagesData[phaseindexInMessagesData][index + 1].sender.id;

        return (
        <TouchableOpacity style={styles.itemContainer} key={item.id}>
            <View>
                {!isSameUserAsPreviousMessage && <Text style={styles.headerText}>{item.sender.firstName} {item.sender.lastName}</Text>}
                <Text>{item.content}</Text>
                <Text>At: {convertedDate}</Text>
                <Text>Index: {item.index}</Text>
                <Text>Read: {item.read ? 'Yes' : 'No'}</Text>
            </View>
        </TouchableOpacity>
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
        paddingTop: 10,
        paddingBottom: 10,
        // borderBottomColor: 'black',
        // borderBottomWidth: 1,
        flexDirection: 'row',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default PhaseChatScreen;
