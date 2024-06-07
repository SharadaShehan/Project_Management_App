import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_PROCESS_MANAGERS_MUTATION, REMOVE_PROCESS_MANAGERS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';

const UpdateProcessManagers = ({ navigation, route }) => {
    const processId = route.params.process.id;
    const currentManagers = route.params.process.managers || [];
    const projectMembers = route.params.projectMembers;
    const [managersToAdd, setManagersToAdd] = useState([]);
    const [managersToRemove, setManagersToRemove] = useState([]);
    const [shownManagers, setShownManagers] = useState([]);
    const [shownNonManagers, setShownNonManagers] = useState([]);
    const [addProcessManagers] = useMutation(ADD_PROCESS_MANAGERS_MUTATION);
    const [removeProcessManagers] = useMutation(REMOVE_PROCESS_MANAGERS_MUTATION);

    useEffect(() => {
        setShownManagers([...managersToAdd, ...currentManagers].filter(manager => !managersToRemove.some(m => m.id === manager.id)));
        const tempManagers = [...managersToAdd, ...currentManagers].filter(manager => !managersToRemove.some(m => m.id === manager.id));
        setShownNonManagers(projectMembers.filter(member => !tempManagers.some(manager => manager.id === member.id)));
    }, [managersToAdd, managersToRemove]);
    
    const updateProcessManagersHandler = async () => {
        try {
            if (!processId ) {
                Alert.alert('Process not found');
                return;
            } else if (managersToAdd.length === 0 && managersToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (managersToAdd.length > 0) {
                    const response = await addProcessManagers({ variables: { id: processId, managers: managersToAdd.map(manager => manager.id) } });
                    if (!response.data.addProcessManagers.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (managersToRemove.length > 0) {
                    const response = await removeProcessManagers({ variables: { id: processId, managers: managersToRemove.map(manager => manager.id) } });
                    if (!response.data.removeProcessManagers.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Process Managers Updated');
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

    const renderManagerItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (managersToAdd.some(manager => manager.id === item.id)) {
                    setManagersToAdd(managersToAdd.filter(manager => manager.id !== item.id));
                } else {
                    setManagersToRemove([...managersToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (managersToRemove.some(manager => manager.id === item.id)) {
                    setManagersToRemove(managersToRemove.filter(manager => manager.id !== item.id));
                } else {
                    setManagersToAdd([...managersToAdd, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };
    
    return (
        <SafeAreaView style={styles.updateManagersContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Process Managers</Text>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={shownManagers}
                        renderItem={renderManagerItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Managers</Text>)}
                    />
                    <FlatList
                        data={shownNonManagers}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'semi-bold', fontSize: 14, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Add Managers from Project Members</Text>)}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updateProcessManagersHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updateManagersContainer: {
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

export default UpdateProcessManagers;
