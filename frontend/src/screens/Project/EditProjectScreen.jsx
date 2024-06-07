import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UPDATE_PROJECT_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';

const EditProjectScreen = ({ navigation, route }) => {
    const projectId = route.params.project.id;
    const [title, setTitle] = useState(route.params.project.title);
    const [description, setDescription] = useState(route.params.project.description);
    const [status, setStatus] = useState(route.params.project.status);
    const statusArray = ['Active', 'Inactive', 'Completed', 'Aborted'];
    const [defaultProcess, setDefaultProcess] = useState(route.params.project.defaultProcess.id);
    const processes = route.params.project.processes;
    const { userData, setUserData } = UserGlobalState();
    const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION);

    const updateProjectHandler = async () => {
        try {
            let variables = {};
            variables.id = projectId;
            if (title !== route.params.project.title) variables.title = title;
            if (description !== route.params.project.description) variables.description = description;
            if (status !== route.params.project.status) variables.status = status;
            if (defaultProcess !== route.params.project.defaultProcess) variables.defaultProcess = defaultProcess;
            const response = await updateProject({ variables });
            if (response.data.updateProject.id) {
                Alert.alert('Project updated successfully');
                navigation.navigate('Project', { id: response.data.updateProject.id, defaultProcess: response.data.updateProject.defaultProcess });
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
        <SafeAreaView style={styles.updateProjectContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Project</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Project Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Project Description"
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
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 5, alignSelf: 'center', marginBottom: 5 }}>Default Process</Text>
                    <SelectList
                        data={processes.map(process => process.title)}
                        title="Default Process"
                        value={processes.find(process => process.id === defaultProcess).title}
                        setSelected={(value) => setDefaultProcess(processes.find(process => process.title === value).id)}
                        boxStyles={{ width: '80%', marginBottom: 6 }}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updateProjectHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updateProjectContainer: {
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
        marginBottom: 20
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

export default EditProjectScreen;
