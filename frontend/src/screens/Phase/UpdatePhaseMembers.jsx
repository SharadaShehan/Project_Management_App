import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_PHASE_MEMBERS_MUTATION, REMOVE_PHASE_MEMBERS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';

const UpdatePhaseMembers = ({ navigation, route }) => {
    const phaseId = route.params.phase.id;
    const currentPhaseMembers = route.params.phase.phaseMembers || [];
    const projectMembers = route.params.project.members;
    const [phaseMembersToAdd, setPhaseMembersToAdd] = useState([]);
    const [phaseMembersToRemove, setPhaseMembersToRemove] = useState([]);
    const [shownPhaseMembers, setShownPhaseMembers] = useState([]);
    const [shownNonPhaseMembers, setShownNonPhaseMembers] = useState([]);
    const [addPhaseMembers] = useMutation(ADD_PHASE_MEMBERS_MUTATION);
    const [removePhaseMembers] = useMutation(REMOVE_PHASE_MEMBERS_MUTATION);

    useEffect(() => {
        setShownPhaseMembers([...phaseMembersToAdd, ...currentPhaseMembers].filter(manager => !phaseMembersToRemove.some(m => m.id === manager.id)));
        const tempManagers = [...phaseMembersToAdd, ...currentPhaseMembers].filter(manager => !phaseMembersToRemove.some(m => m.id === manager.id));
        setShownNonPhaseMembers(projectMembers.filter(member => !tempManagers.some(manager => manager.id === member.id)));
    }, [phaseMembersToAdd, phaseMembersToRemove]);
    
    const updatePhaseMembersHandler = async () => {
        try {
            if (!phaseId ) {
                Alert.alert('Phase not found');
                return;
            } else if (phaseMembersToAdd.length === 0 && phaseMembersToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (phaseMembersToAdd.length > 0) {
                    const response = await addPhaseMembers({ variables: { id: phaseId, members: phaseMembersToAdd.map(manager => manager.id) } });
                    if (!response.data.addPhaseMembers.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (phaseMembersToRemove.length > 0) {
                    const response = await removePhaseMembers({ variables: { id: phaseId, members: phaseMembersToRemove.map(manager => manager.id) } });
                    if (!response.data.removePhaseMembers.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Phase Members Updated');
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
                <Image source={item.imageURL ? { uri: item.imageURL } : require('../../../images/profile.webp')} style={{ width: 20, height: 20, borderRadius: 25 }} />
                <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.username}> ({item.username})</Text>
                {cross && <Text style={{ color: 'red', fontSize: 20, marginLeft: 'auto' }}>X</Text>}
            </View>
        );
    };

    const renderPhaseMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (phaseMembersToAdd.some(manager => manager.id === item.id)) {
                    setPhaseMembersToAdd(phaseMembersToAdd.filter(manager => manager.id !== item.id));
                } else {
                    setPhaseMembersToRemove([...phaseMembersToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderProjectMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (phaseMembersToRemove.some(manager => manager.id === item.id)) {
                    setPhaseMembersToRemove(phaseMembersToRemove.filter(manager => manager.id !== item.id));
                } else {
                    setPhaseMembersToAdd([...phaseMembersToAdd, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };
    
    return (
        <SafeAreaView style={styles.updatePhaseMembersContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Phase Members</Text>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={shownPhaseMembers}
                        renderItem={renderPhaseMemberItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phase Members</Text>)}
                    />
                    <FlatList
                        data={shownNonPhaseMembers}
                        renderItem={renderProjectMemberItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'semi-bold', fontSize: 14, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Add to Phase from Project Members</Text>)}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updatePhaseMembersHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updatePhaseMembersContainer: {
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
        marginBottom: 20
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

export default UpdatePhaseMembers;
