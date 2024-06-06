import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REMOVE_MEMBER_MUTATION } from '../queries/Mutations';
import { ONE_PROJECT_QUERY } from '../queries/Queries';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { UserGlobalState } from '../layout/UserState';

const RemoveMemberScreen = ({ navigation, route }) => {
    const { userData, setUserData } = UserGlobalState();
    const [removeMember] = useMutation(REMOVE_MEMBER_MUTATION);
    const { data:projectData, loading:projectLoading, error:projectError } = useQuery(ONE_PROJECT_QUERY, { variables: { id: route.params.project.id }, fetchPolicy: 'network-only' });

    const removeMemberHandler = async (memberId) => {
        try {
            if (!memberId || !route.params.project.id) {
                Alert.alert('An error occurred, please try again');
                return;
            }
            const variables = { memberId: memberId, projectId: route.params.project.id };
            const response = await removeMember({ variables: variables });
            if (response.data.removeMember) {
                Alert.alert('Member removed');
                navigation.navigate('RemoveMember', { project: route.params.project });
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

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                Alert.alert('Remove Member', `Are you sure you want to remove this member? (${item.firstName} ${item.lastName})`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', onPress: () => removeMemberHandler(item.id) }
                ]);
            }} style={styles.userItemContainer} key={item.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={item.imageURL ? { uri: item.imageURL } : require('../../images/profile.webp')} style={{ width: 20, height: 20, borderRadius: 25 }} />
                    <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.username}> ({item.username})</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.removeMembersContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Remove Members</Text>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={projectData && projectData.project.members}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                        ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>Select a member to remove</Text>}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    removeMembersContainer: {
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
});

export default RemoveMemberScreen;