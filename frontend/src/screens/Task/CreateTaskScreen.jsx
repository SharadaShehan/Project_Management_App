import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CREATE_TASK_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { parseErrorMessage } from '../../utils/errorHandler';
import { Button, TextInput as ThemedTextInput, Card } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const CreateTaskScreen = ({ navigation, route }) => {
    const phaseId = route.params?.phase?.id;
    
    if (!phaseId) {
        Alert.alert('Error', 'Invalid phase');
        navigation.goBack();
        return null;
    }
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
            // Validate required fields
            if (!title || !title.trim()) {
                Alert.alert('Error', 'Title is required');
                return;
            }
            if (!description || !description.trim()) {
                Alert.alert('Error', 'Description is required');
                return;
            }
            
            let variables = {
                phaseId,
                title: title.trim(),
                description: description.trim()
            };
            
            if (endDate) variables.endDate = endDate;
            if (endTime) variables.endTime = endTime;
            if (timezoneOffset) variables.timezoneOffset = timezoneOffset;
            
            console.log('Creating task with variables:', variables);
            const response = await createTask({ variables: variables });
            console.log('Response:', JSON.stringify(response, null, 2));
            if (response?.data?.createTask?.id) {
                Alert.alert('Task Created');
                navigation.navigate('Task', { task: response.data.createTask, phase: route.params.phase });
            } else {
                // Check if there are errors in the response
                console.log('Response errors:', response?.errors);
                if (response?.errors && response.errors.length > 0) {
                    const errorMsg = parseErrorMessage({ graphQLErrors: response.errors });
                    console.log('Parsed error message:', errorMsg);
                    Alert.alert('Error', errorMsg);
                } else {
                    console.log('No response data and no errors');
                    Alert.alert('Error', 'An error occurred, please try again');
                }
            }
        } catch (err) {
            console.log('Caught error:', err);
            console.log('Error message:', err.message);
            const errorMsg = parseErrorMessage(err);
            console.log('Parsed error message:', errorMsg);
            Alert.alert('Error', errorMsg);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Create Task</Text>
                    
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
                    
                    <View style={styles.dateSection}>
                        <Text style={styles.sectionLabel}>End Date & Time</Text>
                        <TouchableOpacity 
                            style={styles.dateButton}
                            onPress={() => setDatePickerVisibility(true)}
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
                        
                        <ThemedTextInput
                            placeholder="Timezone Offset"
                            value={timezoneOffset.toString()}
                            onChangeText={setTimezoneOffset}
                            icon={<MaterialIcons name="public" size={20} color={colors.neutral[400]} />}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                    </View>
                    
                    {isDatePickerVisible &&
                        <DateTimePicker
                            mode="date"
                            value={new Date()}
                            onChange={(event, date) => {
                                setEndDate(date.toISOString().split('T')[0]);
                                setDatePickerVisibility(false);
                            }}
                        />
                    }
                    {isTimePickerVisible &&
                        <DateTimePicker
                            mode="time"
                            value={new Date()}
                            onChange={(event, date) => {
                                setEndTime(date.toTimeString().split(' ')[0].slice(0, 5));
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
                        onPress={createTaskHandler}
                        icon={<MaterialIcons name="add" size={20} color={colors.text.inverse} />}
                        style={styles.buttonHalf}
                    >
                        Create
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

export default CreateTaskScreen;