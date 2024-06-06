import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { MessagesGlobalState } from '../../layout/MessagesState';
import { UserGlobalState } from '../../layout/UserState';
import { getLogoImage } from '../../logoImages';

const MessagesScreen = ({ navigation }) => {
    const mLimit = 100;
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const { userData, setUserData } = UserGlobalState();
    let otherUser;

    const renderItem = ({ item }) => {
        if (!item || item.length === 0) return null;
        const firstItem = item[0];
        if (firstItem && firstItem.receiver) {
            if (firstItem.receiver.id === userData.id) {
                otherUser = firstItem.sender; 
            } else {
                otherUser = firstItem.receiver;
            }
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
                <View style={styles.ImageContainer}>
                    {firstItem.project && !firstItem.phase && <Image source={getLogoImage(firstItem.project.logo)} style={styles.imageItem} />}
                    {firstItem.phase && <Image source={getLogoImage(firstItem.project.logo)} style={styles.imageItem} />}
                    {firstItem.receiver && <Image source={otherUser.imageURL ? { uri: otherUser.imageURL } : require('../../images/profile.webp')}  style={styles.imageItem} />}
                </View>
                <View style={{ flexDirection: 'column', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', width: '88%' }}>
                        <View style={{ width: '75%' }}>
                            {firstItem.project && !firstItem.phase && <Text style={styles.headerText}>{firstItem.project.title}</Text>}
                            {firstItem.phase && <Text style={styles.headerText}>{firstItem.project.title}: {firstItem.phase.title}</Text>}
                            {firstItem.receiver && <Text style={styles.headerText}>{otherUser.firstName} {otherUser.lastName}</Text>}
                        </View>
                        <View style={{ width: '25%' }}>
                            <Text style={{ textAlign: 'left', fontSize: 11, color: '#808080', paddingTop: 4 }}
                            >{convertedDate}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', width: '90%', marginBottom: firstItem.content.length > 30 ? 15 : 0 }}>
                        {firstItem.sender && (firstItem.phase || firstItem.project) && <Text style={styles.contentText}>{firstItem.sender.firstName} {firstItem.sender.lastName} : {firstItem.content}</Text>}
                        {firstItem.receiver &&<Text style={styles.contentText}>{firstItem.content}</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={messagesData.filter((item) => item.length > 0)}
                renderItem={renderItem}
                keyExtractor={(item) => item[0].id.toString()}
            />
            <TouchableOpacity onPress={() => navigation.navigate('NewChat')} style={styles.addNewButton}>
                <Text style={{ color: '#fff', fontSize: 20 }}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
        paddingHorizontal: 8,
        paddingTop: 20,
    },
    itemContainer: {
        paddingTop: 2,
        paddingBottom: 6,
        marginBottom: 4,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 25,
        width: '95%',
    },
    ImageContainer: {
        margin: 12,
        // marginTop: 10,
    },
    imageItem: {
        width: 50,
        height: 50,
        borderRadius: 50,
        // margin: 10,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        color: '#070'
    },
    contentText: {
        fontWeight: 'bold',
        color: '#808080'
    },
    addNewButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: '#007BFF',
        borderRadius: 50,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default MessagesScreen;
