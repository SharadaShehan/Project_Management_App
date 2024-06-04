import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { PROJECTS_QUERY } from '../queries/Queries';
import { SEARCH_USERS_MUTATION } from '../queries/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { SearchBar } from "react-native-elements";
import { UserGlobalState } from '../layout/UserState';
import { logoImagesArray, getLogoImage } from '../logoImages';
import { MessagesGlobalState } from '../layout/MessagesState';

const NewChatScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [projectsList, setProjectsList] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const { messagesData, setMessagesData } = MessagesGlobalState();

    const { data:projectsData, loading:projectsLoading, error:projectsError } = useQuery(PROJECTS_QUERY);
    const [searchUsers] = useMutation(SEARCH_USERS_MUTATION);

    const searchTextChangeHandler = async (text) => {
        setSearchText(text);
        if (text.length > 0) {
            setSearchLoading(true);
            try {
                const response = await searchUsers({ variables: { searchText: text } });
                setSearchList(response.data.searchUsers);
            } catch (err) {
                const message = err.message.split('.').join('.\n');
                Alert.alert('Error', message);
            }
            setSearchLoading(false);
        } else {
            setSearchList([]);
        }
    };

    const renderUserItem = ({ item }) => {
        // check if user is already in messagesData, if so, don't show it
        const userIndexInMessagesData = messagesData.findIndex((messageList) => messageList[0] && messageList[0].receiver && (messageList[0].receiver.id === item.id || messageList[0].sender.id === item.id));
        if (userIndexInMessagesData > -1) return null;
        // check if user is the same as the logged in user, if so, don't show it
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => { navigation.navigate('PrivateChat', { user: item }) }}  style={styles.userItemContainer} key={item.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={item.imageURL ? { uri: item.imageURL } : require('../../images/profile.webp')} style={{ width: 20, height: 20, borderRadius: 25 }} />
                    <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.username}> ({item.username})</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderProjectItem = ({ item }) => {
        // check if project is already in messagesData, if so, don't show it
        const projectIndexInMessagesData = messagesData.findIndex((messageList) => messageList[0] && messageList[0].project && messageList[0].project.id === item.id);
        if (projectIndexInMessagesData > -1) return null;
        return (
            <TouchableOpacity onPress={() => { navigation.navigate('ProjectChat', { project: item }) }} style={styles.userItemContainer} key={item.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={getLogoImage(item.logo)} style={{ width: 20, height: 20, borderRadius: 25 }} />
                    <Text style={styles.fullName}>{item.title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.createProjectContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Select User/Project</Text>
                <View style={styles.inputContainer}>
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: '5%' }}>Users</Text>
                    <SearchBar
                        placeholder="Search for Users"
                        onChangeText={searchTextChangeHandler}
                        value={searchText}
                        onClear={() => setSearchList([])}
                        containerStyle={{ backgroundColor: 'transparent', borderColor: 'transparent', width: '85%' }}
                        inputContainerStyle={{ backgroundColor: '#eee' }}
                        inputStyle={{ color: '#000', fontSize: 14 }}
                        leftIconContainerStyle={{ paddingLeft: 5 }}
                        lightTheme={true}
                        round={true}
                        showCancel={searchText.length > 0}
                        showLoading={searchLoading}
                    />
                    <FlatList
                        data={searchList}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                    />
                    <FlatList
                        data={projectsData.projects}
                        renderItem={renderProjectItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                        ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: '6%', marginTop: '8%' }}>Projects</Text>}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createProjectContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '90%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        marginTop: '12%',
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginTop: '5%',
        alignItems: 'center',
        marginBottom: '6%',
        width: '100%',
    },
    input: {
        width: '80%',
        height: 35,
        borderColor: '#007BFF',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        // borderRadius: 10,
        marginBottom: '5%',
        padding: 5,
    },
    removeBtn: {
        color: 'white',
        backgroundColor: 'red',
        padding: 3,
        width: '80%',
        borderRadius: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 5,
    },
    userItemContainer: {
        padding: 14,
        backgroundColor: '#eee',
        marginVertical: 2,
        borderRadius: 10,
        width: '100%',
    },
    fullName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#434343',
        paddingLeft: 8,
    },
    username: {
        fontSize: 12,
        color: '#434343',
        paddingRight: 8,
    },
    rowButtonsContainer: {
        marginTop: '2%',
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '44%',
        alignSelf: 'center',
        marginHorizontal: '3%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default NewChatScreen;
