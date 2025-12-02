import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSIGN_TASK_MUTATION, UNASSIGN_TASK_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const UpdateTaskAssignees = ({ navigation, route }) => {
    const taskId = route.params?.task?.id;
    
    if (!taskId) {
        Alert.alert('Error', 'Invalid task');
        navigation.goBack();
        return null;
    }
    const currentAssignees = route.params.task.taskAssignees || [];
    const phaseMembers = route.params.phase.phaseMembers || [];
    const [assigneesToAdd, setAssigneesToAdd] = useState([]);
    const [assigneesToRemove, setAssigneesToRemove] = useState([]);
    const [shownAssignees, setShownAssignees] = useState([]);
    const [shownNonAssignees, setShownNonAssignees] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const [assignTask] = useMutation(ASSIGN_TASK_MUTATION);
    const [unassignTask] = useMutation(UNASSIGN_TASK_MUTATION);

    useEffect(() => {
        setShownAssignees([...assigneesToAdd, ...currentAssignees].filter(assignee => !assigneesToRemove.some(m => m.id === assignee.id)));
        const tempManagers = [...assigneesToAdd, ...currentAssignees].filter(assignee => !assigneesToRemove.some(m => m.id === assignee.id));
        setShownNonAssignees(phaseMembers.filter(member => !tempManagers.some(assignee => assignee.id === member.id)));
    }, [assigneesToAdd, assigneesToRemove]);
    
    const updateTaskAssigneesHandler = async () => {
        try {
            if (!taskId) {
                Alert.alert('Task ID not found');
                return;
            } else if (assigneesToAdd.length === 0 && assigneesToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (assigneesToAdd.length > 0) {
                    const response = await assignTask({ variables: { id: taskId, assignees: assigneesToAdd.map(assignee => assignee.id) } });
                    if (!response?.data?.assignTask?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (assigneesToRemove.length > 0) {
                    const response = await unassignTask({ variables: { id: taskId, assignees: assigneesToRemove.map(assignee => assignee.id) } });
                    if (!response?.data?.unassignTask?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Task Assignees Updated');
                navigation.goBack();
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
            Alert.alert('Error', message);
        }
    }

    const RenderItem = ({ item, cross }) => {
        return (
            <View style={styles.memberItemContent}>
                <Avatar
                    imageUrl={item.imageURL}
                    name={`${item.firstName} ${item.lastName}`}
                    size={32}
                />
                <View style={styles.memberTextContainer}>
                    <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.memberUsername}>@{item.username}</Text>
                </View>
                {cross && <MaterialIcons name="close" size={20} color={colors.status.error} style={styles.removeIcon} />}
            </View>
        );
    };

    const renderAssigneeItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (assigneesToAdd.some(assignee => assignee.id === item.id)) {
                    setAssigneesToAdd(assigneesToAdd.filter(assignee => assignee.id !== item.id));
                } else {
                    setAssigneesToRemove([...assigneesToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (assigneesToRemove.some(assignee => assignee.id === item.id)) {
                    setAssigneesToRemove(assigneesToRemove.filter(assignee => assignee.id !== item.id));
                } else {
                    setAssigneesToAdd([...assigneesToAdd, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Update Task Assignees</Text>
                    
                    <View style={styles.assigneesSection}>
                        <Text style={styles.sectionTitle}>Current Assignees</Text>
                        {shownAssignees.length === 0 ? (
                            <Text style={styles.emptyText}>No assignees yet</Text>
                        ) : (
                            <FlatList
                                data={shownAssignees}
                                renderItem={renderAssigneeItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                    
                    <View style={styles.membersSection}>
                        <Text style={styles.sectionTitle}>Add from Phase Members</Text>
                        <FlatList
                            data={shownNonAssignees}
                            renderItem={renderMemberItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
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
                            onPress={updateTaskAssigneesHandler}
                            style={styles.actionButton}
                        >
                            Update
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
    assigneesSection: {
        marginBottom: spacing.lg,
    },
    membersSection: {
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
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: spacing.md,
    },
    userItemContainer: {
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
    },
    memberItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    memberTextContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    memberUsername: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    removeIcon: {
        marginLeft: 'auto',
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

export default UpdateTaskAssignees;
