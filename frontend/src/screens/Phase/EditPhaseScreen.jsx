import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UPDATE_PHASE_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const EditPhaseScreen = ({ navigation, route }) => {
    const phaseId = route.params?.phase?.id;
    const process = route.params?.process;
    const project = route.params?.project;
    
    if (!phaseId) {
        Alert.alert('Error', 'Invalid phase');
        navigation.goBack();
        return null;
    }
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
            if (response?.data?.updatePhase?.id) {
                Alert.alert('Phase Updated Successfully');
                navigation.navigate('Phase', { id: phaseId, process: process, project: project });
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
        backgroundColor: colors.background.secondary,
    },
    innerContainer: {
        flex: 1,
        margin: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        textAlign: 'center',
        color: colors.text.primary,
        marginVertical: spacing.lg,
        lineHeight: typography.lineHeight.tight * typography.fontSize['2xl'],
    },
    inputContainer: {
        gap: spacing.md,
    },
    rowButtonsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
});

export default EditPhaseScreen;
