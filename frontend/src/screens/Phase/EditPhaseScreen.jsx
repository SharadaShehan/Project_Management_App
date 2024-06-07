import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UPDATE_PHASE_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';

const EditPhaseScreen = ({ navigation, route }) => {
    const phaseId = route.params.phase.id;
    const process = route.params.process;
    const project = route.params.project;
    const [title, setTitle] = useState(route.params.phase.title);
    const [description, setDescription] = useState(route.params.phase.description);
    const [status, setStatus] = useState(route.params.phase.status);
    const statusArray = ['Active', 'Inactive', 'Completed', 'Aborted'];
    const [startDate, setStartDate] = useState(route.params.phase.startDate);
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [endDate, setEndDate] = useState(route.params.phase.endDate);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [endTime, setEndTime] = useState(route.params.phase.endTime);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [timezoneOffset, setTimezoneOffset] = useState(route.params.phase.timezoneOffset);
    const { userData, setUserData } = UserGlobalState();
    const [updatePhase] = useMutation(UPDATE_PHASE_MUTATION);

    console.log(endTime);

    const updatePhaseHandler = async () => {
        try {
            let variables = {};
            variables.id = phaseId;
            if (title !== route.params.phase.title) variables.title = title;
            if (description !== route.params.phase.description) variables.description = description;
            if (status !== route.params.phase.status) variables.status = status;
            if (startDate !== route.params.phase.startDate) variables.startDate = startDate;
            if (endDate !== route.params.phase.endDate) variables.endDate = endDate;
            if (endTime !== route.params.phase.endTime) variables.endTime = endTime;
            if (timezoneOffset !== route.params.phase.timezoneOffset) variables.timezoneOffset = timezoneOffset;
            const response = await updatePhase({ variables: variables });
            if (response.data.updatePhase.id) {
                Alert.alert('Phase Updated Successfully');
                navigation.navigate('Phase', { id: phaseId, process: process, project: project });
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
        <SafeAreaView style={styles.updatePhaseContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Phase</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Phase Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phase Description"
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
                    {startDate && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>Start Date: {startDate}</Text>}
                    {!startDate && <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 6, alignSelf: 'center', marginBottom: 4 }}>Select Start Date</Text>}
                    <Button title="Show Date Picker" onPress={() => setStartDatePickerVisibility(true)} />
                    {isStartDatePickerVisible && 
                    <DateTimePicker
                        mode="date"
                        value={ startDate ? new Date(startDate) : new Date() }
                        onChange={(event, date) => {setStartDate(date.toISOString().split('T')[0]); setStartDatePickerVisibility(false);}}
                    />}
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
                    <TouchableOpacity style={styles.button} onPress={updatePhaseHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updatePhaseContainer: {
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
        marginTop: '5%',
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
        height: 25,
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

export default EditPhaseScreen;
