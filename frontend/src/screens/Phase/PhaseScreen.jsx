import React from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PHASE_QUERY } from '../../graphql/Queries';
import { DELETE_PHASE_MUTATION } from '../../graphql/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';
import { Button, Card, Badge, Avatar, LoadingSpinner } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const PhaseScreen = ({navigation, route}) => {
    const phaseId = route.params?.id;
    const process = route.params?.process;
    const project = route.params?.project;
    
    if (!phaseId) {
        Alert.alert('Error', 'Invalid phase');
        navigation.goBack();
        return null;
    }
    
    const { userData } = UserGlobalState();
    const { data:phaseData, loading:phaseLoading, error:phaseError } = useQuery(PHASE_QUERY, { variables: { id: phaseId }, fetchPolicy: 'network-only' });
    const [deletePhase] = useMutation(DELETE_PHASE_MUTATION);

    const RenderItem = ({ item }) => (
        <Card 
            style={styles.taskCard}
            variant="outlined"
            onPress={() => navigation.navigate('Task', { task: item, phase: phaseData?.phase })}
        >
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{item?.title}</Text>
                <Badge variant={item?.status === 'Active' ? 'success' : 'error'}>
                    {item?.status}
                </Badge>
            </View>
            {item?.description && <Text style={styles.taskDescription}>{item.description}</Text>}
            {item?.taskAssignees?.length === 0 ? (
                <View style={styles.assigneesSection}>
                    <MaterialIcons name="person-off" size={16} color={colors.text.secondary} />
                    <Text style={styles.unassignedText}>Task Unassigned</Text>
                </View>
            ) : (
                <View style={styles.assigneesContainer}>
                    <Text style={styles.assigneesLabel}>Assigned to:</Text>
                    <View style={styles.assigneesList}>
                        {item.taskAssignees.map((assignee) => (
                            <View style={styles.assigneeChip} key={assignee.id}>
                                <Avatar 
                                    source={assignee.imageURL ? { uri: assignee.imageURL } : require('../../../images/profile.webp')}
                                    name={`${assignee.firstName} ${assignee.lastName}`}
                                    size="xs"
                                />
                                <Text style={styles.assigneeName}>{assignee.firstName} {assignee.lastName}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
            {item?.endDate && (
                <View style={styles.dueDateRow}>
                    <MaterialIcons name="event" size={16} color={colors.primary.main} />
                    <Text style={styles.dueDateText}>Due: {item.endDate.split('T')[0]}{item.endTime ? ` at ${item.endTime.substring(0, 5)}` : ''}</Text>
                </View>
            )}
        </Card>
    );

    if (phaseLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {phaseData?.phase && (
                    <View>
                        <Card style={styles.phaseCard}>
                            <View style={styles.phaseHeader}>
                                <Text style={styles.phaseTitle}>{phaseData.phase.title}</Text>
                                <Badge variant={phaseData.phase.status === 'Active' ? 'success' : 'error'}>
                                    {phaseData.phase.status}
                                </Badge>
                            </View>
                            {phaseData.phase.description && (
                                <Text style={styles.phaseDescription}>{phaseData.phase.description}</Text>
                            )}
                        </Card>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tasks</Text>
                            {phaseData.phase.tasks?.length === 0 ? (
                                <Text style={styles.emptyText}>No tasks in current phase</Text>
                            ) : (
                                phaseData.phase.tasks?.map((task) => <RenderItem key={task.id} item={task} />)
                            )}
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onPress={() => navigation.navigate('CreateTask', { phase: phaseData.phase })}
                                icon={<MaterialIcons name="add" size={20} color={colors.text.inverse} />}
                                style={styles.addButton}
                            >
                                Add New Task
                            </Button>
                        </View>
                    </View>
                )}

                {phaseData?.phase && (
                    <Card style={styles.membersCard}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="admin-panel-settings" size={24} color={colors.primary.main} />
                            <Text style={styles.subsectionTitle}>Phase Admins</Text>
                        </View>
                        {phaseData.phase.phaseAdmins?.length === 0 ? (
                            <Text style={styles.emptyText}>No admins in current phase</Text>
                        ) : (
                            <View style={styles.membersList}>
                                {phaseData.phase.phaseAdmins?.map((admin) => (
                                    <View style={styles.memberItem} key={admin.id}>
                                        <Avatar 
                                            source={admin.imageURL ? { uri: admin.imageURL } : require('../../../images/profile.webp')}
                                            name={`${admin.firstName} ${admin.lastName}`}
                                            size="sm"
                                        />
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>{admin.firstName} {admin.lastName}</Text>
                                            <Text style={styles.memberUsername}>@{admin.username}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        <Button
                            variant="outline"
                            size="md"
                            fullWidth
                            onPress={() => navigation.navigate('UpdatePhaseAdmins', { phase: phaseData.phase, project: project, process: process })}
                            icon={<MaterialIcons name="person-add" size={20} color={colors.primary.main} />}
                            style={styles.memberButton}
                        >
                            Add/Remove Admins
                        </Button>

                        <View style={[styles.sectionHeader, styles.secondaryHeader]}>
                            <MaterialIcons name="people" size={24} color={colors.primary.main} />
                            <Text style={styles.subsectionTitle}>Phase Members</Text>
                        </View>
                        {phaseData.phase.phaseMembers?.length === 0 ? (
                            <Text style={styles.emptyText}>No members in current phase</Text>
                        ) : (
                            <View style={styles.membersList}>
                                {phaseData.phase.phaseMembers?.map((member) => (
                                    <View style={styles.memberItem} key={member.id}>
                                        <Avatar 
                                            source={member.imageURL ? { uri: member.imageURL } : require('../../../images/profile.webp')}
                                            name={`${member.firstName} ${member.lastName}`}
                                            size="sm"
                                        />
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>{member.firstName} {member.lastName}</Text>
                                            <Text style={styles.memberUsername}>@{member.username}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        <Button
                            variant="outline"
                            size="md"
                            fullWidth
                            onPress={() => navigation.navigate('UpdatePhaseMembers', { phase: phaseData.phase, project: project, process: process })}
                            icon={<MaterialIcons name="person-add" size={20} color={colors.primary.main} />}
                            style={styles.memberButton}
                        >
                            Add/Remove Members
                        </Button>
                    </Card>
                )}
                {phaseData?.phase && (
                    <View style={styles.actionsContainer}>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onPress={() => navigation.navigate('EditPhase', { phase: phaseData.phase, project: project, process: process })}
                            icon={<MaterialIcons name="edit" size={20} color={colors.text.inverse} />}
                        >
                            Edit Phase
                        </Button>
                        <Button
                            variant="danger"
                            size="lg"
                            fullWidth
                            onPress={() => {
                                Alert.alert(
                                    'Delete Phase',
                                    'Are you sure you want to delete this phase?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { 
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await deletePhase({ variables: { id: phaseId } });
                                                    navigation.goBack();
                                                } catch (error) {
                                                    Alert.alert('Error', error.message);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            icon={<MaterialIcons name="delete" size={20} color={colors.text.inverse} />}
                            style={styles.actionButton}
                        >
                            Delete Phase
                        </Button>
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
    phaseCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    phaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    phaseTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        flex: 1,
        marginRight: spacing.sm,
    },
    phaseDescription: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: spacing.lg,
    },
    taskCard: {
        marginBottom: spacing.md,
        borderWidth: 0,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    taskTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        flex: 1,
        marginRight: spacing.sm,
    },
    taskDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    assigneesSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    assigneesContainer: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    assigneesLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    unassignedText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontStyle: 'italic',
    },
    assigneesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    assigneeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    assigneeName: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.medium,
    },
    dueDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    dueDateText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    addButton: {
        marginTop: spacing.md,
    },
    membersCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    secondaryHeader: {
        marginTop: spacing.lg,
    },
    subsectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    membersList: {
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
    },
    memberInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
    },
    memberUsername: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    memberButton: {
        marginTop: 0,
    },
    actionsContainer: {
        gap: spacing.md,
    },
    actionButton: {
        marginTop: 0,
    },
})

export default PhaseScreen;
