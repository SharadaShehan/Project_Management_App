import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_PHASE_ADMINS_MUTATION, REMOVE_PHASE_ADMINS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { UserGlobalState } from '../../layout/UserState';

const UpdatePhaseAdmins = ({ navigation, route }) => {
    const phaseId = route.params.phase.id;
    const currenAdmins = route.params.phase.phaseAdmins || [];
    const phaseMembers = route.params.phase.phaseMembers || [];
    const [adminsToAdd, setAdminsToAdd] = useState([]);
    const [adminsToRemove, setAdminsToRemove] = useState([]);
    const [shownAdmins, setShownAdmins] = useState([]);
    const [shownNonAdmins, setShownNonAdmins] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const [addPhaseAdmins] = useMutation(ADD_PHASE_ADMINS_MUTATION);
    const [removePhaseAdmins] = useMutation(REMOVE_PHASE_ADMINS_MUTATION);

    useEffect(() => {
        setShownAdmins([...adminsToAdd, ...currenAdmins].filter(manager => !adminsToRemove.some(m => m.id === manager.id)));
        const tempAdmins = [...adminsToAdd, ...currenAdmins].filter(manager => !adminsToRemove.some(m => m.id === manager.id));
        setShownNonAdmins(phaseMembers.filter(member => !tempAdmins.some(manager => manager.id === member.id)));
    }, [adminsToAdd, adminsToRemove]);
    
    const updatePhaseAdminsHandler = async () => {
        try {
            if (!phaseId ) {
                Alert.alert('Phase not found');
                return;
            } else if (adminsToAdd.length === 0 && adminsToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (adminsToAdd.length > 0) {
                    const response = await addPhaseAdmins({ variables: { id: phaseId, admins: adminsToAdd.map(admin => admin.id) } });
                    if (!response.data.addPhaseAdmins.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (adminsToRemove.length > 0) {
                    const response = await removePhaseAdmins({ variables: { id: phaseId, admins: adminsToRemove.map(admin => admin.id) } });
                    if (!response.data.removePhaseAdmins.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Phase Admins Updated');
                navigation.goBack();
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message.split('.').join('.\n');
            Alert.alert('Error', message);
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

    const renderAdminItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (adminsToAdd.some(admin => admin.id === item.id)) {
                    setAdminsToAdd(adminsToAdd.filter(admin => admin.id !== item.id));
                } else {
                    setAdminsToRemove([...adminsToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (adminsToRemove.some(admin => admin.id === item.id)) {
                    setAdminsToRemove(adminsToRemove.filter(admin => admin.id !== item.id));
                } else {
                    setAdminsToAdd([...adminsToAdd, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };
    
    return (
        <SafeAreaView style={styles.updateAdminsContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Phase Admins</Text>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={shownAdmins}
                        renderItem={renderAdminItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phase Admins</Text>)}
                    />
                    <FlatList
                        data={shownNonAdmins}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'semi-bold', fontSize: 14, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Add Admins from Phase Members</Text>)}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updatePhaseAdminsHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updateAdminsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '95%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        marginTop: '3%',
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginTop: '5%',
        alignItems: 'center',
        marginBottom: '4%',
        width: '100%',
    },
    input: {
        width: '80%',
        height: 28,
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

export default UpdatePhaseAdmins;
