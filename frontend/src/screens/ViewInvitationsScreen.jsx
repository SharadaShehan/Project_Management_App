import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RESPOND_REQUEST_MUTATION, DELETE_REQUEST_MUTATION } from '../queries/Mutations';
import { RECEIVED_REQUESTS_QUERY } from '../queries/Queries';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { UserGlobalState } from '../layout/UserState';

const ViewInvitationsScreen = ({ navigation, route }) => {
    const [invitations, setInvitations] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const [respondRequest] = useMutation(RESPOND_REQUEST_MUTATION);
    const [deleteRequest] = useMutation(DELETE_REQUEST_MUTATION);
    const { data:requestsData, loading:requestsLoading, error:requestsError } = useQuery(RECEIVED_REQUESTS_QUERY, { fetchPolicy: 'network-only' });

    const respondRequestHandler = async (requestId, status) => {
        try {
            if (!requestId || !status) {
                Alert.alert('An error occurred, please try again');
                return;
            }
            const variables = { id: requestId, status: status };
            const response = await respondRequest({ variables: variables });
            if (response.data.respondRequest.id) {
                if (response.data.respondRequest.status === 'Accepted') {
                    Alert.alert('Request Accepted');
                    navigation.navigate('ViewInvitations');
                } else if (response.data.respondRequest.status === 'Rejected') {
                    Alert.alert('Request Rejected');
                    navigation.navigate('ViewInvitations');
                } else {
                    Alert.alert('Could not respond to request');
                    return;
                }
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

    const deleteRequestHandler = async (requestId) => {
        try {
            if (!requestId) {
                Alert.alert('An error occurred, please try again');
                return;
            }
            const variables = { id: requestId };
            const response = await deleteRequest({ variables: variables });
            if (response.data.deleteRequest) {
                Alert.alert('Request Deleted');
                navigation.navigate('ViewInvitations');
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

    const requestItem = ({ item }) => {
        return (
            <View style={{ padding: 15, paddingHorizontal: 5, marginHorizontal: 15, borderWidth: 1, borderColor: '#007BFF', borderRadius: 5 }}>
                <Text style={styles.contentText}>{item.project.owner.firstName} {item.project.owner.lastName} ({item.project.owner.username}) invites you to join project "{item.project.title}"</Text>
                    {item.status === 'Pending' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.button} onPress={() => respondRequestHandler(item.id, 'Accepted')}>
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => respondRequestHandler(item.id, 'Rejected')}>
                            <Text style={styles.buttonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                    {(item.status === 'Accepted' || item.status === 'Rejected') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.respondedStatusText, { color: item.status === 'Accepted' ? '#00dd00' : '#dd0000' }]}>Request {item.status}</Text>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => {
                            Alert.alert('Delete Request', 'Are you sure you want to delete this request?', [
                                { text: 'Cancel', onPress: () => {} },
                                { text: 'Delete', onPress: () => deleteRequestHandler(item.id) }
                            ]);
                        }}>
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                    )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.inviteUsersContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Project Invitations</Text>
                    <FlatList
                        data={requestsData ? requestsData.receivedRequests : []}
                        renderItem={requestItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={8}
                    />
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
        height: '95%',
        marginBottom: '6%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        marginTop: '12%',
        marginBottom: '6%',
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
    contentText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#434343',
        paddingLeft: 8,
        marginBottom: 8,
    },
    respondedStatusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#434343',
        paddingLeft: 8,
    },
    deleteBtn: {
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 5,
        width: '44%',
        alignSelf: 'center',
        marginHorizontal: '3%',
    },
    rowButtonsContainer: {
        marginTop: '2%',
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 8,
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

export default ViewInvitationsScreen;