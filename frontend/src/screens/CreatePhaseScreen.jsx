import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { CREATE_PHASE_MUTATION } from '../queries/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';

const CreatePhaseScreen = ({ navigation, route }) => {
    const processId = route.params.process.id;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [timezoneOffset, setTimezoneOffset] = useState(new Date().getTimezoneOffset());
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [createPhase] = useMutation(CREATE_PHASE_MUTATION);
    
    const createPhasehandler = async () => {
        try {
            let variables = { processId: processId, title: title, description: description, startDate: startDate, endDate: endDate, endTime: endTime, timezoneOffset: timezoneOffset };
            const response = await createPhase({ variables: variables });
            if (response.data.createPhase.id) {
                Alert.alert('Phase Created');
                navigation.navigate('Phase', { id: response.data.createPhase.id, process: route.params.process });
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

    const handleStartDateSelectionComplete = (date) => {
        console.log("A date has been picked: ", date.toISOString().split('T')[0]);
        setStartDate(date.toISOString().split('T')[0]);
        setStartDatePickerVisibility(false);
    };

    const handleEndDateSelectionComplete = (date) => {
        console.log("A date has been picked: ", date.toISOString().split('T')[0]);
        setEndDate(date.toISOString().split('T')[0]);
        setEndDatePickerVisibility(false);
    };

    const handleTimeSelectionComplete = (time) => {
        console.log("A time has been picked: ", time.toTimeString().split(' ')[0]);
        setEndTime(time.toTimeString().split(' ')[0]);
        setTimePickerVisibility(false);
    }

    const hideStartDatePicker = () => { setStartDatePickerVisibility(false); };
    const hideEndDatePicker = () => { setEndDatePickerVisibility(false); };
    const hideTimePicker = () => { setTimePickerVisibility(false); };

    return (
        <SafeAreaView style={styles.createPhaseContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Create Phase</Text>
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
                    {startDate && <Text>Start Date: {startDate}</Text>}
                    {!startDate && <Text>Select Start Date</Text>}
                    <Button title="Show Date Picker" onPress={() => setStartDatePickerVisibility(true)} />
                    <DateTimePickerModal
                        isVisible={isStartDatePickerVisible}
                        mode="date"
                        onConfirm={handleStartDateSelectionComplete}
                        onCancel={hideStartDatePicker}
                    />
                    {endDate && <Text>End Date: {endDate}</Text>}
                    {!endDate && <Text>Select End Date</Text>}
                    <Button title="Show Date Picker" onPress={() => setEndDatePickerVisibility(true)} />
                    <DateTimePickerModal
                        isVisible={isEndDatePickerVisible}
                        mode="date"
                        onConfirm={handleEndDateSelectionComplete}
                        onCancel={hideEndDatePicker}
                    />
                    {endTime && <Text>End Time: {endTime}</Text>}
                    {!endTime && <Text>Select End Time</Text>}
                    <Button title="Show Time Picker" onPress={() => setTimePickerVisibility(true)} />
                    <DateTimePickerModal
                        isVisible={isTimePickerVisible}
                        mode="time"
                        onConfirm={handleTimeSelectionComplete}
                        onCancel={hideTimePicker}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Timezone Offset"
                        value={timezoneOffset.toString()}
                        onChangeText={setTimezoneOffset}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={createPhasehandler}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createPhaseContainer: {
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

export default CreatePhaseScreen;