import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATE_REQUESTS_MUTATION, SEARCH_USERS_MUTATION } from '../queries/Mutations';
import { SENT_REQUESTS_QUERY } from '../queries/Queries';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { SearchBar } from "react-native-elements"; 
import { UserGlobalState } from '../layout/UserState';

const InviteUsersScreen = ({ navigation, route }) => {
    const [newMembers, setNewMembers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const { userData, setUserData } = UserGlobalState();
    const [createRequests] = useMutation(CREATE_REQUESTS_MUTATION);
    const [searchUsers] = useMutation(SEARCH_USERS_MUTATION);
    const { data:requestsData, loading:requestsLoading, error:requestsError } = useQuery(SENT_REQUESTS_QUERY, { variables: { projectId: route.params.project.id }, fetchPolicy: 'network-only' });

    const sendRequestsHandler = async () => {
        try {
            const newMembersIds = newMembers.map(member => member.id);
            const variables = {};
            variables.projectId = route.params.project.id;
            if (newMembersIds.length === 0) {
                Alert.alert('Please select at least one member');
                return;
            } else {
                variables.receiverIds = newMembersIds;
            }
            const response = await createRequests({ variables: variables });
            if (response.data.createRequests) {
                Alert.alert('Requests Sent');
                navigation.navigate('Project', { id: route.params.project.id, defaultProcess: route.params.project.defaultProcess });
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message.split('.').join('.\n');
            Alert.alert('Error', message);
        }
    }

    const searchTextChangeHandler = async (text) => {
        setSearchText(text);
        if (text.length > 0) {
            setSearchLoading(true);
            try {
                const response = await searchUsers({ variables: { searchText: text } });
                let searchUsersList = response.data.searchUsers;
                searchUsersList = searchUsersList.filter(user => !route.params.project.members.some(member => member.id === user.id));
                searchUsersList = searchUsersList.filter(user => user.id !== userData.id);
                searchUsersList = searchUsersList.filter(user => !newMembers.some(member => member.id === user.id));
                searchUsersList = searchUsersList.filter(user => !requestsData.sentRequests.some(request => request.receiver.id === user.id));
                setSearchList(searchUsersList)
            } catch (err) {
                const message = err.message.split('.').join('.\n');
                Alert.alert('Error', message);
            }
            setSearchLoading(false);
        } else {
            setSearchList([]);
        }
    }

    const RenderItem = ({ item, cross }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={item.imageURL ? { uri: item.imageURL } : require('../../images/profile.webp')} style={{ width: 20, height: 20, borderRadius: 25 }} />
                <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.username}> ({item.username})</Text>
                {cross && <Text style={{ color: 'red', fontSize: 20, marginLeft: 'auto' }}>X</Text>}
            </View>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                setNewMembers(newMembers.filter(member => member.id !== item.id));
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderUserItem = ({ item }) => {
        if (newMembers.some(member => member.id === item.id)) return null;
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => {
                if (!newMembers.some(member => member.id === item.id)) {
                    setNewMembers([...newMembers, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.inviteUsersContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Invite Users</Text>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={newMembers}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                        ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>New Members</Text>}
                    />
                    <SearchBar
                        placeholder="Search for Users"
                        onChangeText={searchTextChangeHandler}
                        value={searchText}
                        onClear={() => setSearchList([])}
                        containerStyle={{ backgroundColor: 'transparent', borderColor: 'transparent', width: '80%' }}
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
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={sendRequestsHandler}>
                        <Text style={styles.buttonText}>Invite</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.outerButtonContainer}>
                <TouchableOpacity style={styles.removeBtn} onPress={() => navigation.navigate('RemoveMember', { project: route.params.project })}>
                    <Text style={styles.buttonText}>Remove Members</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    inviteUsersContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '88%',
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
        padding: 7,
        width: '80%',
        borderRadius: 5,
        textAlign: 'center',
        selfAlign: 'center',
    },
    userItemContainer: {
        padding: 10,
        backgroundColor: '#eee',
        marginVertical: 2,
        borderRadius: 15,
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
    outerButtonContainer: {
        width: '80%',
        marginBottom: '5%',
        marginTop: '5%',
        alignItems: 'center',
    }
});

export default InviteUsersScreen;