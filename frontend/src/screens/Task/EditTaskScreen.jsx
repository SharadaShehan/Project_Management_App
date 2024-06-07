import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UPDATE_TASK_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';

const EditTaskScreen = ({ navigation, route }) => {
    const taskId = route.params.task.id;
    const phase = route.params.phase;
    const [title, setTitle] = useState(route.params.task.title);
    const [description, setDescription] = useState(route.params.task.description);
    const [status, setStatus] = useState(route.params.task.status);
    const statusArray = ['Active', 'Inactive', 'Completed', 'Aborted'];
    const [endDate, setEndDate] = useState(route.params.task.endDate);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [endTime, setEndTime] = useState(route.params.task.endTime);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [timezoneOffset, setTimezoneOffset] = useState(route.params.task.timezoneOffset);
    const { userData, setUserData } = UserGlobalState();
    const [updateTask] = useMutation(UPDATE_TASK_MUTATION);

    const updateTaskHandler = async () => {
        try {
            let variables = {};
            variables.id = taskId;
            if (title !== route.params.task.title) variables.title = title;
            if (description !== route.params.task.description) variables.description = description;
            if (status !== route.params.task.status) variables.status = status;
            if (endDate !== route.params.task.endDate) variables.endDate = endDate;
            if (endTime !== route.params.task.endTime) variables.endTime = endTime;
            if (timezoneOffset !== route.params.task.timezoneOffset) variables.timezoneOffset = timezoneOffset;
            const response = await updateTask({ variables: variables });
            if (response.data.updateTask.id) {
                Alert.alert('Task Updated Successfully');
                navigation.navigate('Task', { task: response.data.updateTask, phase: phase });
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
        <SafeAreaView style={styles.updateTaskContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Task</Text>
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
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 5, alignSelf: 'center', marginBottom: 5 }}>Status</Text>
                    <SelectList
                        data={statusArray}
                        title="Status"
                        value={status}
                        setSelected={setStatus}
                        boxStyles={{ width: '80%', marginBottom: 6 }}
                    /> 
                    {endDate && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>End Date: {endDate}</Text>}
                    {!endDate && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>Select End Date</Text>}
                    <Button title="Show Date Picker" onPress={() => setEndDatePickerVisibility(true)} />
                    {isEndDatePickerVisible &&
                    <DateTimePicker
                        mode="date"
                        value={ endDate ? new Date(endDate) : new Date() }
                        onChange={(event, date) => {setEndDate(date.toISOString().split('T')[0]); setEndDatePickerVisibility(false);}}
                    />}
                    {endTime && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>End Time: {endTime}</Text>}
                    {!endTime && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>Select End Time</Text>}
                    <Button title="Show Time Picker" onPress={() => setTimePickerVisibility(true)} />
                    {isTimePickerVisible &&
                    <DateTimePicker
                        mode="time"
                        value={ endTime ? new Date(endTime) : new Date() }
                        onChange={(event, date) => { setEndTime(date.toISOString().split('T')[1].split('.')[0].slice(0, 5)); setTimePickerVisibility(false);}}
                    />}
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updateTaskHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updateTaskContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        paddingBottom: 10,
        backgroundColor: '#4CBB17'
    },
    innerContainer: {
        width: '95%',
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#fff',
        paddingHorizontal: '4%',
        paddingBottom: 10,
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

export default EditTaskScreen;
