import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATE_PROCESS_MUTATION } from '../queries/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';

const CreateProcessScreen = ({ navigation, route }) => {
    const projectId = route.params.project.id;
    const priorityLevels = ['Low', 'Normal', 'High'];
    const projectMembers = route.params.project.members;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [managers, setManagers] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const [createProcess] = useMutation(CREATE_PROCESS_MUTATION);
    
    const createProcessHandler = async () => {
        try {
            let variables = { projectId: projectId, title: title, description: description, priority: priority };
            if (managers.length > 0) {
                variables.managers = managers.map((manager) => manager.id);
            }
            const response = await createProcess({ variables: variables });
            if (response.data.createProcess.id) {
                Alert.alert('Process Created');
                navigation.navigate('Project', { id: projectId, defaultProcess: response.data.createProcess });
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

    const renderManagerItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                setMembers(managers.filter(manager => manager.id !== item.id));
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        if (managers.some(manager => manager.id === item.id)) return null;
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => {
                if (!managers.some(manager => manager.id === item.id)) {
                    setMembers([...managers, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.createProcessContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Create Process</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Process Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Process Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <SelectList
                        data={priorityLevels}
                        label="Priority Level"
                        value={priority}
                        onChange={setPriority}
                    />
                    <FlatList
                        data={managers}
                        renderItem={renderManagerItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Managers</Text>)}
                    />
                    <FlatList
                        data={projectMembers}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Members</Text>)}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={createProcessHandler}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createProcessContainer: {
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

export default CreateProcessScreen;