import React from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { MessagesGlobalState } from '../layout/MessagesState';

const MessagesScreen = ({ navigation }) => {
    const mLimit = 100;
    const { messagesData, setMessagesData } = MessagesGlobalState();

    const renderItem = ({ item }) => {
        const firstItem = item[0];
        const dateObj = new Date(parseInt(firstItem.createdAt));
        const convertedDate = dateObj.toLocaleString().replace(',', '');
        console.log(convertedDate);

        return (
            <TouchableOpacity onPress={() => {
                if (firstItem.phase) navigation.navigate('PhaseChat', { phase: firstItem.phase, lastMessageIndex: firstItem.index, limit: mLimit })
                else if (firstItem.project) navigation.navigate('ProjectChat', { project: firstItem.project, lastMessageIndex: firstItem.index, limit: mLimit })
                else if (firstItem.sender) navigation.navigate('PrivateChat', { sender: firstItem.sender, lastMessageIndex: firstItem.index, limit: mLimit })
                else alert('Invalid Route');
            }} style={styles.itemContainer} key={firstItem.id}>
                <View>
                    {firstItem.project && <Text style={styles.headerText}>{firstItem.project.title}</Text>}
                    {firstItem.phase && <Text style={styles.headerText}>{firstItem.phase.title}</Text>}
                    {firstItem.sender && (firstItem.phase || firstItem.project) && <Text>{firstItem.sender.firstName} {firstItem.sender.lastName} : {firstItem.content}</Text>}
                    {firstItem.sender && !(firstItem.phase || firstItem.project) && <Text style={styles.headerText}>{firstItem.sender.firstName} {firstItem.sender.lastName}</Text>}
                    {firstItem.sender && !(firstItem.phase || firstItem.project) &&<Text>{firstItem.content}</Text>}
                    <Text>At: {convertedDate}</Text>
                </View>
            </TouchableOpacity>
        );
    }
    console.log(messagesData);

    return (
        <View style={styles.container}>
            <FlatList
                data={messagesData}
                renderItem={renderItem}
                keyExtractor={(item) => item[0].id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
        margin: 20,
        // alignItems: 'center',
        justifyContent: 'center',
        height: '80%',
    },
    itemContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        flexDirection: 'row',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MessagesScreen;
