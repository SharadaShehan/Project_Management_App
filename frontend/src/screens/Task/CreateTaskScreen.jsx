import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CREATE_TASK_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';

const CreateTaskScreen = ({ navigation, route }) => {
    const phaseId = route.params.phase.id;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [timezoneOffset, setTimezoneOffset] = useState(0);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [createTask] = useMutation(CREATE_TASK_MUTATION);
    
    const createTaskHandler = async () => {
        try {
            let variables = {};
            if (phaseId) variables.phaseId = phaseId;
            if (title) variables.title = title;
            if (description) variables.description = description;
            if (endDate) variables.endDate = endDate;
            if (endTime) variables.endTime = endTime;
            if (timezoneOffset) variables.timezoneOffset = timezoneOffset;
            const response = await createTask({ variables: variables });
            if (response.data.createTask.id) {
                Alert.alert('Task Created');
                navigation.navigate('Task', { task: response.data.createTask, phase: route.params.phase });
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
        <SafeAreaView style={styles.createTaskContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Create Task</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Task Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Task Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                    {endDate && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>End Date: {endDate}</Text>}
                    {!endDate && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>Select End Date</Text>}
                    <Button title="Show Date Picker" onPress={() => setDatePickerVisibility(true)} />
                    {isDatePickerVisible &&
                    <DateTimePicker
                        mode="date"
                        value={new Date()}
                        onChange={(event, date) => {setEndDate(date.toISOString().split('T')[0]); setDatePickerVisibility(false);}}
                    />}
                    {endTime && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>End Time: {endTime}</Text>}
                    {!endTime && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>Select End Time</Text>}
                    <Button title="Show Time Picker" onPress={() => setTimePickerVisibility(true)} />
                    {isTimePickerVisible &&
                    <DateTimePicker
                        mode="time"
                        value={new Date()}
                        onChange={(event, date) => {setEndTime(date.toTimeString().split(' ')[0].slice(0, 5)); setTimePickerVisibility(false);}}
                    />}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 14, alignSelf: 'center', width: '65%' }}>Timezone Offset for Values</Text>
                        <TextInput
                            style={styles.timezoneInput}
                            placeholder="Timezone Offset"
                            value={timezoneOffset.toString()}
                            onChangeText={setTimezoneOffset}
                        />
                    </View>
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={createTaskHandler}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createTaskContainer: {
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
    timezoneInput: {
        width: '15%',
        height: 30,
        borderColor: '#007BFF',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        // borderRadius: 10,
        marginTop: '5%',
        marginBottom: '3%',
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

export default CreateTaskScreen;