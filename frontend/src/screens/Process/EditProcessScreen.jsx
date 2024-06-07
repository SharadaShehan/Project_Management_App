import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UPDATE_PROCESS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';

const EditProcessScreen = ({ navigation, route }) => {
    const processId = route.params.process.id;
    const projectId = route.params.project.id;
    const [title, setTitle] = useState(route.params.process.title);
    const [description, setDescription] = useState(route.params.process.description);
    const [status, setStatus] = useState(route.params.process.status);
    const statusArray = ['Active', 'Inactive', 'Completed', 'Aborted'];
    const [priority, setPriority] = useState(route.params.process.priority);
    const priorityLevels = ['Low', 'Normal', 'High'];
    const { userData, setUserData } = UserGlobalState();
    const [updateProcess] = useMutation(UPDATE_PROCESS_MUTATION);

    const updateProcessHandler = async () => {
        try {
            let variables = {};
            variables.id = processId;
            if (title !== route.params.process.title) variables.title = title;
            if (description !== route.params.process.description) variables.description = description;
            if (status !== route.params.process.status) variables.status = status;
            if (priority !== route.params.process.priority) variables.priority = priority;
            const response = await updateProcess({ variables: variables });
            if (response.data.updateProcess.id) {
                Alert.alert('Process Updated Successfully');
                navigation.navigate('Project', { id: projectId, defaultProcess: response.data.updateProcess });
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

    return (
        <SafeAreaView style={styles.updateProcessContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Process</Text>
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
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 5, alignSelf: 'center', marginBottom: 5 }}>Status</Text>
                    <SelectList
                        data={statusArray}
                        title="Status"
                        value={status}
                        setSelected={setStatus}
                        boxStyles={{ width: '80%', marginBottom: 6 }}
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 5, alignSelf: 'center', marginBottom: 5 }}>Priority</Text>
                    <SelectList
                        data={priorityLevels}
                        title="Priority"
                        value={priority}
                        setSelected={setPriority}
                        boxStyles={{ width: '80%', marginBottom: 6 }}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updateProcessHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updateProcessContainer: {
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
        marginBottom: 20
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

export default EditProcessScreen;
