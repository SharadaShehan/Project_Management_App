import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UPDATE_TASK_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';
import { parseErrorMessage } from '../../utils/errorHandler';
import { Button, TextInput as ThemedTextInput, Card } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const EditTaskScreen = ({ navigation, route }) => {
    const taskId = route.params.task.id;
    const phase = route.params.phase;
    const [title, setTitle] = useState(route.params.task.title);
    const [description, setDescription] = useState(route.params.task.description);
    const [status, setStatus] = useState(route.params.task.status);
    const statusArray = ['Active', 'Inactive', 'Completed', 'Aborted'];
    const [endDate, setEndDate] = useState(route.params.task.endDate ? route.params.task.endDate.split('T')[0] : '');
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
            // Only include fields that have actually changed and are not null
            if (title !== route.params.task.title && title !== null && title !== undefined) variables.title = title;
            if (description !== route.params.task.description && description !== null && description !== undefined) variables.description = description;
            if (status !== route.params.task.status && status !== null && status !== undefined) variables.status = status;
            const originalEndDate = route.params.task.endDate ? route.params.task.endDate.split('T')[0] : '';
            if (endDate !== originalEndDate) {
                // Convert YYYY-MM-DD to full ISO format
                variables.endDate = endDate ? new Date(endDate + 'T00:00:00.000Z').toISOString() : null;
            }
            if (endTime !== route.params.task.endTime && endTime !== undefined) variables.endTime = endTime;
            if (timezoneOffset !== route.params.task.timezoneOffset && timezoneOffset !== undefined) variables.timezoneOffset = timezoneOffset;
            const response = await updateTask({ variables: variables });
            if (response?.data?.updateTask?.id) {
                Alert.alert('Task Updated Successfully');
                navigation.navigate('Task', { task: response.data.updateTask, phase: phase });
            } else {
                // Check if there are errors in the response
                if (response?.errors && response.errors.length > 0) {
                    Alert.alert('Error', parseErrorMessage({ graphQLErrors: response.errors }));
                } else {
                    Alert.alert('Error', 'An error occurred, please try again');
                }
            }
        } catch (err) {
            console.log(err);
            Alert.alert('Error', parseErrorMessage(err));
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Update Task</Text>
                    
                    <ThemedTextInput
                        placeholder="Task Title"
                        value={title}
                        onChangeText={setTitle}
                        icon={<MaterialIcons name="title" size={20} color={colors.neutral[400]} />}
                        style={styles.input}
                    />
                    
                    <ThemedTextInput
                        placeholder="Task Description"
                        value={description}
                        onChangeText={setDescription}
                        icon={<MaterialIcons name="description" size={20} color={colors.neutral[400]} />}
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                    />
                    
                    <View style={styles.selectSection}>
                        <Text style={styles.selectLabel}>Status</Text>
                        <SelectList
                            data={statusArray}
                            title="Status"
                            value={status}
                            setSelected={setStatus}
                            boxStyles={styles.selectBox}
                        /> 
                    </View>
                    
                    <View style={styles.dateSection}>
                        <Text style={styles.sectionLabel}>End Date & Time</Text>
                        <TouchableOpacity 
                            style={styles.dateButton}
                            onPress={() => setEndDatePickerVisibility(true)}
                        >
                            <MaterialIcons name="event" size={20} color={colors.primary.main} />
                            <Text style={styles.dateButtonText}>
                                {endDate ? `Date: ${endDate}` : 'Select End Date'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.dateButton}
                            onPress={() => setTimePickerVisibility(true)}
                        >
                            <MaterialIcons name="access-time" size={20} color={colors.primary.main} />
                            <Text style={styles.dateButtonText}>
                                {endTime ? `Time: ${endTime}` : 'Select End Time'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {isEndDatePickerVisible &&
                        <DateTimePicker
                            mode="date"
                            value={endDate ? new Date(endDate) : new Date()}
                            onChange={(event, date) => {
                                setEndDate(date.toISOString().split('T')[0]);
                                setEndDatePickerVisibility(false);
                            }}
                        />
                    }
                    {isTimePickerVisible &&
                        <DateTimePicker
                            mode="time"
                            value={endTime ? new Date(`2000-01-01T${endTime}:00`) : new Date()}
                            onChange={(event, date) => {
                                setEndTime(date.toISOString().split('T')[1].split('.')[0].slice(0, 5));
                                setTimePickerVisibility(false);
                            }}
                        />
                    }
                </Card>
                
                <View style={styles.buttonContainer}>
                    <Button
                        variant="outline"
                        size="lg"
                        onPress={() => navigation.goBack()}
                        style={styles.buttonHalf}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onPress={updateTaskHandler}
                        icon={<MaterialIcons name="save" size={20} color={colors.text.inverse} />}
                        style={styles.buttonHalf}
                    >
                        Update
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    formCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    input: {
        marginBottom: spacing.lg,
    },
    textArea: {
        marginBottom: spacing.lg,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    selectSection: {
        marginBottom: spacing.lg,
    },
    selectLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    selectBox: {
        borderColor: colors.border.default,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background.white,
    },
    dateSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    sectionLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    dateButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    buttonHalf: {
        flex: 1,
    },
});

export default EditTaskScreen;
