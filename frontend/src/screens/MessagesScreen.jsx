import React from 'react';
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { MessagesGlobalState } from '../layout/MessagesState';
import { UserGlobalState } from '../layout/UserState';

const MessagesScreen = ({ navigation }) => {
    const mLimit = 100;
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const { userData, setUserData } = UserGlobalState();
    let otherUser;

    const renderItem = ({ item }) => {
        const firstItem = item[0];
        if (firstItem && firstItem.receiver) {
            if (firstItem.receiver.id === userData.id) {
                otherUser = firstItem.sender; 
            } else {
                otherUser = firstItem.receiver;
            }
            console.log(otherUser);
        }
        const dateObj = new Date(parseInt(firstItem.createdAt));
        // const convertedDate = dateObj.toLocaleString().replace(',', '');
        let convertedDate;
        // check if date is today
        if (dateObj.getDate() === new Date().getDate()) {
            convertedDate = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        } else if (dateObj.getDate() === new Date().getDate() - 1) {
            convertedDate = 'Yesterday';
        } else if (dateObj.getFullYear() !== new Date().getFullYear()) {
            // check if year is not current year
            convertedDate = dateObj.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
            convertedDate = dateObj.toLocaleString('en-US', { month: 'long', day: 'numeric' });
        }

        return (
            <TouchableOpacity onPress={() => {
                if (firstItem.phase) navigation.navigate('PhaseChat', { phase: firstItem.phase, lastMessageIndex: firstItem.index, limit: mLimit })
                else if (firstItem.project) navigation.navigate('ProjectChat', { project: firstItem.project, lastMessageIndex: firstItem.index, limit: mLimit })
                else {
                    if (firstItem.sender.id === userData.id) navigation.navigate('PrivateChat', { user: firstItem.receiver, lastMessageIndex: firstItem.index, limit: mLimit })
                    else if ((firstItem.receiver.id === userData.id)) navigation.navigate('PrivateChat', { user: firstItem.sender, lastMessageIndex: firstItem.index, limit: mLimit })
                    else console.log('invalid message');
                }
            }} style={styles.itemContainer} key={firstItem.id}>
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '80%' }}>
                            {firstItem.project && <Text style={styles.headerText}>{firstItem.project.title}</Text>}
                            {firstItem.phase && <Text style={styles.headerText}>{firstItem.phase.title}</Text>}
                            {firstItem.receiver && <Text style={styles.headerText}>{otherUser.firstName} {otherUser.lastName}</Text>}
                        </View>
                        <View style={{ width: '20%' }}>
                            <Text style={{ textAlign: 'left', fontSize: 12, color: '#808080', paddingTop: 3 }}
                            >{convertedDate}</Text>
                        </View>
                    </View>
                    {firstItem.sender && (firstItem.phase || firstItem.project) && <Text style={{ fontWeight: 600, color: '#808080' }}>{firstItem.sender.firstName} {firstItem.sender.lastName} : {firstItem.content}</Text>}
                    {firstItem.receiver &&<Text style={{ fontWeight: 600, color: '#808080' }}>{firstItem.content}</Text>}
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
        height: '80%'
    },
    itemContainer: {
        paddingTop: 15,
        paddingBottom: 15,
        // borderBottomColor: 'black',
        // borderBottomWidth: 1,
        flexDirection: 'row',
        // backgroundColor: '#ddd',
        // borderRadius: 5,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
});

export default MessagesScreen;
