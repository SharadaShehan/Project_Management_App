import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CREATE_PHASE_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { parseErrorMessage } from '../../utils/errorHandler';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const CreatePhaseScreen = ({ navigation, route }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState('1');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [timezoneOffset, setTimezoneOffset] = useState(new Date().getTimezoneOffset().toString());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [createPhase] = useMutation(CREATE_PHASE_MUTATION);
    
    const processId = route.params?.process?.id;
    
    React.useEffect(() => {
        if (!processId) {
            Alert.alert('Error', 'Invalid process');
            navigation.goBack();
        }
    }, [processId, navigation]);
    
    const createPhasehandler = async () => {
        try {
            if (!processId) {
                Alert.alert('Error', 'Invalid process');
                navigation.goBack();
                return;
            }
            
            if (!title || !description || !order) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }
            
            const orderNum = parseInt(order);
            if (isNaN(orderNum) || orderNum < 0) {
                Alert.alert('Error', 'Order must be a non-negative number');
                return;
            }
            
            let variables = {
                processId,
                name: title,
                description,
                order: orderNum
            };
            
            // Add optional date/time fields if provided
            if (startDate) {
                variables.startDate = startDate.toISOString();
            }
            if (endDate) {
                variables.endDate = endDate.toISOString();
            }
            if (endTime) {
                const hours = endTime.getHours().toString().padStart(2, '0');
                const minutes = endTime.getMinutes().toString().padStart(2, '0');
                variables.endTime = `${hours}:${minutes}`;
            }
            if (timezoneOffset && timezoneOffset.trim() !== '') {
                const offsetNum = parseInt(timezoneOffset);
                if (!isNaN(offsetNum)) {
                    variables.timezoneOffset = offsetNum;
                }
            }
            
            const response = await createPhase({ variables: variables });
            if (response?.data?.createPhase?.id) {
                Alert.alert('Phase Created', 'Phase has been created successfully');
                navigation.goBack();
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
                    <Text style={styles.title}>Create Phase</Text>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Phase Name</Text>
                        <TextInput
                            placeholder="Enter phase name"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            placeholder="Enter phase description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            style={styles.textArea}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Order</Text>
                        <TextInput
                            placeholder="Enter order number (1, 2, 3...)"
                            value={order}
                            onChangeText={setOrder}
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={styles.dateSection}>
                        <Text style={styles.sectionTitle}>Schedule (Optional)</Text>
                        
                        <View style={styles.dateInputContainer}>
                            <Button
                                variant="outline"
                                onPress={() => setShowStartDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <View style={styles.dateButtonContent}>
                                    <MaterialIcons name="event" size={20} color={colors.primary.main} />
                                    <Text style={styles.dateButtonText}>
                                        {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                                    </Text>
                                </View>
                            </Button>
                            {showStartDatePicker && (
                                <DateTimePicker
                                    value={startDate || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowStartDatePicker(false);
                                        if (selectedDate) {
                                            setStartDate(selectedDate);
                                        }
                                    }}
                                />
                            )}
                        </View>
                        
                        <View style={styles.dateInputContainer}>
                            <Button
                                variant="outline"
                                onPress={() => setShowEndDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <View style={styles.dateButtonContent}>
                                    <MaterialIcons name="event" size={20} color={colors.primary.main} />
                                    <Text style={styles.dateButtonText}>
                                        {endDate ? endDate.toLocaleDateString() : 'End Date'}
                                    </Text>
                                </View>
                            </Button>
                            {showEndDatePicker && (
                                <DateTimePicker
                                    value={endDate || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowEndDatePicker(false);
                                        if (selectedDate) {
                                            setEndDate(selectedDate);
                                        }
                                    }}
                                />
                            )}
                        </View>
                        
                        <View style={styles.dateInputContainer}>
                            <Button
                                variant="outline"
                                onPress={() => setShowEndTimePicker(true)}
                                style={styles.dateButton}
                            >
                                <View style={styles.dateButtonContent}>
                                    <MaterialIcons name="access-time" size={20} color={colors.primary.main} />
                                    <Text style={styles.dateButtonText}>
                                        {endTime ? endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'End Time'}
                                    </Text>
                                </View>
                            </Button>
                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={endTime || new Date()}
                                    mode="time"
                                    display="default"
                                    onChange={(event, selectedTime) => {
                                        setShowEndTimePicker(false);
                                        if (selectedTime) {
                                            setEndTime(selectedTime);
                                        }
                                    }}
                                />
                            )}
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Timezone Offset (minutes)</Text>
                            <TextInput
                                placeholder="e.g., -300 for EST"
                                value={timezoneOffset}
                                onChangeText={setTimezoneOffset}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    
                    <View style={styles.buttonRow}>
                        <Button
                            variant="outline"
                            onPress={() => navigation.goBack()}
                            style={styles.actionButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={createPhasehandler}
                            style={styles.actionButton}
                        >
                            Create Phase
                        </Button>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    scrollContent: {
        padding: spacing.md,
    },
    formCard: {
        padding: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: typography.lineHeight.tight * typography.fontSize['2xl'],
    },
    formSection: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dateSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
        lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
    },
    dateInputContainer: {
        marginBottom: spacing.md,
    },
    dateButton: {
        width: '100%',
    },
    dateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dateButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        flex: 1,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    actionButton: {
        flex: 1,
    },
});

export default CreatePhaseScreen;