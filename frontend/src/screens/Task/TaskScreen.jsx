import React from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TASK_QUERY } from '../../graphql/Queries';
import { DELETE_TASK_MUTATION } from '../../graphql/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';
import { Button, Card, Badge, Avatar, LoadingSpinner } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const TaskScreen = ({ navigation, route }) => {
    const taskId = route.params?.task?.id;
    
    if (!taskId) {
        Alert.alert('Error', 'Invalid task');
        navigation.goBack();
        return null;
    }
    const phase = route.params?.phase;
    const { userData } = UserGlobalState();
    const { data:taskData, loading:taskLoading, error:taskError } = useQuery(TASK_QUERY, { variables: { id: taskId }, fetchPolicy: 'network-only' });
    const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
        onCompleted: () => {
            console.log('Task deleted successfully');
            navigation.goBack();
        },
        onError: (error) => {
            console.log('Delete task error:', error);
            Alert.alert('Error', error.message);
        }
    });

    if (taskLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (taskError) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={64} color={colors.status.error} />
                <Text style={styles.errorText}>Failed to load task</Text>
                <Button variant="primary" onPress={() => navigation.goBack()}>Go Back</Button>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {taskData?.task && (
                    <View>
                        <Card style={styles.taskCard}>
                            <View style={styles.header}>
                                <Text style={styles.taskTitle}>{taskData.task.title}</Text>
                                <Badge 
                                    variant={taskData.task.status === 'Active' ? 'success' : 'error'}
                                    size="md"
                                >
                                    {taskData.task.status}
                                </Badge>
                            </View>

                            {taskData.task.description && (
                                <Text style={styles.taskDescription}>{taskData.task.description}</Text>
                            )}

                            {taskData.task.endDate && (
                                <View style={styles.dueDate}>
                                    <MaterialIcons name="schedule" size={20} color={colors.text.secondary} />
                                    <Text style={styles.dueDateText}>
                                        Due: {taskData.task.endDate.split('T')[0]}
                                        {taskData.task.endTime ? ` at ${taskData.task.endTime.substring(0, 5)}` : ''}
                                    </Text>
                                </View>
                            )}
                        </Card>

                        <Card style={styles.assigneesCard}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="people" size={24} color={colors.primary.main} />
                                <Text style={styles.sectionTitle}>Assignees</Text>
                            </View>

                            {taskData.task.taskAssignees?.length === 0 ? (
                                <Text style={styles.noAssigneesText}>No assignees for this task</Text>
                            ) : (
                                <View style={styles.assigneesList}>
                                    {taskData.task.taskAssignees.map((assignee) => (
                                        <View style={styles.assigneeItem} key={assignee.id}>
                                            <Avatar 
                                                source={assignee.imageURL ? { uri: assignee.imageURL } : require('../../../images/profile.webp')}
                                                name={`${assignee.firstName} ${assignee.lastName}`}
                                                size="sm"
                                            />
                                            <View style={styles.assigneeInfo}>
                                                <Text style={styles.assigneeName}>
                                                    {assignee.firstName} {assignee.lastName}
                                                </Text>
                                                <Text style={styles.assigneeUsername}>@{assignee.username}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Card>

                        <View style={styles.actionsContainer}>
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onPress={() => navigation.navigate('UpdateTaskAssignees', { task: taskData.task, phase: route.params.phase })}
                                icon={<MaterialIcons name="person-add" size={20} color={colors.text.inverse} />}
                            >
                                Manage Assignees
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                fullWidth
                                onPress={() => navigation.navigate('EditTask', { task: taskData.task, phase: route.params.phase })}
                                icon={<MaterialIcons name="edit" size={20} color={colors.primary.main} />}
                                style={styles.actionButton}
                            >
                                Edit Task
                            </Button>

                            <Button
                                variant="danger"
                                size="lg"
                                fullWidth
                                onPress={() => {
                                    Alert.alert(
                                        'Delete Task',
                                        'Are you sure you want to delete this task?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { 
                                                text: 'Delete', 
                                                style: 'destructive',
                                                onPress: () => deleteTask({ variables: { id: taskId } })
                                            }
                                        ]
                                    );
                                }}
                                icon={<MaterialIcons name="delete" size={20} color={colors.text.inverse} />}
                                style={styles.actionButton}
                            >
                                Delete Task
                            </Button>
                        </View>
                    </View>
                )}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background.default,
    },
    errorText: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    taskCard: {
        marginBottom: spacing.md,
        borderWidth: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    taskTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        flex: 1,
        lineHeight: typography.lineHeight.tight * typography.fontSize.xl,
    },
    taskDescription: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
        marginBottom: spacing.md,
        textAlign: 'left',
    },
    dueDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    dueDateText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium,
    },
    assigneesCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    noAssigneesText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: spacing.lg,
    },
    assigneesList: {
        gap: spacing.sm,
    },
    assigneeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        gap: spacing.md,
    },
    assigneeInfo: {
        flex: 1,
    },
    assigneeName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    assigneeUsername: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    actionsContainer: {
        gap: spacing.md,
    },
    actionButton: {
        marginTop: 0,
    },
})

export default TaskScreen;
