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
    const processId = route.params?.process?.id;
    const projectId = route.params?.project?.id;
    
    if (!processId || !projectId) {
        Alert.alert('Error', 'Invalid process or project');
        navigation.goBack();
        return null;
    }
    
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
            if (response?.data?.updateProcess?.id) {
                Alert.alert('Process Updated Successfully');
                navigation.navigate('Project', { id: projectId, defaultProcess: response.data.updateProcess });
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
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
        backgroundColor: '#F9FAFB',
    },
    innerContainer: {
        flex: 1,
        margin: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#111827',
        marginVertical: 24,
    },
    inputContainer: {
        gap: 16,
    },
    input: {
        backgroundColor: '#FFFFFF',
    },
    rowButtonsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 32,
    },
    button: {
        flex: 1,
    },
});

export default EditProcessScreen;
