import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ONE_PROJECT_QUERY, PROCESS_QUERY } from '../../graphql/Queries';
import { DELETE_PROJECT_MUTATION, DELETE_PROCESS_MUTATION } from '../../graphql/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';
import { Button, Card, Badge, Avatar, LoadingSpinner } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const ProjectScreen = ({navigation, route}) => {
    const projectId = route.params?.id;
    
    if (!projectId) {
        Alert.alert('Error', 'Invalid project');
        navigation.goBack();
        return null;
    }
    
    const { userData } = UserGlobalState();
    const [selectedOption, setSelectedOption] = useState(route.params?.defaultProcess?.id || null);
    const { data:projectData, loading:projectLoading, error:projectError } = useQuery(ONE_PROJECT_QUERY, {
        variables: { id: projectId }, fetchPolicy: 'network-only'
    });
    const { data:processData, loading:processLoading, error:processError } = useQuery(PROCESS_QUERY, {
        variables: { id: route.params.defaultProcess?.id || '' }, 
        fetchPolicy: 'network-only',
        skip: !route.params.defaultProcess?.id
    });
    const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION);
    const [deleteProcess] = useMutation(DELETE_PROCESS_MUTATION);

    const renderItem = ({ item }) => {
        if (!item || !item.id) return null;
        const isSelected = selectedOption === item.id;
        return (
            <TouchableOpacity
              style={[styles.processTab, isSelected && styles.processTabActive]}
              onPress={() => {
                if (projectData && projectData.project && projectData.project.id) {
                    navigation.navigate('Project', { id: projectData.project.id, defaultProcess: item });
                    setSelectedOption(item.id);
                }
              }}
            >
              <Text style={[styles.processTabText, isSelected && styles.processTabTextActive]}>
                {item.name || 'Untitled'}
              </Text>
            </TouchableOpacity>
        );
    };

    if (projectLoading || processLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {projectData && (
                    <View>
                        <Card style={styles.projectCard}>
                            <View style={styles.projectHeader}>
                                <Text style={styles.projectTitle}>{projectData.project.title}</Text>
                                <Badge variant={projectData.project.status === 'Active' ? 'success' : 'error'}>
                                    {projectData.project.status}
                                </Badge>
                            </View>
                            <Text style={styles.projectDescription}>{projectData.project.description}</Text>
                        </Card>

                        <View style={styles.processSection}>
                            <Text style={styles.sectionLabel}>Processes</Text>
                            <FlatList
                                data={projectData.project.processes}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.processListContent}
                                ListFooterComponent={() => {
                                    if (userData.id === projectData.project.owner.id) {
                                        return (
                                            <TouchableOpacity 
                                                style={styles.addProcessTab} 
                                                onPress={() => navigation.navigate('CreateProcess', { project: projectData.project })}
                                            >
                                                <MaterialIcons name="add" size={20} color={colors.primary.main} />
                                            </TouchableOpacity>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </View>
                    </View>
                )}

                {projectData && processData && (
                    <Card style={styles.processCard}>
                        <View style={styles.processTitleRow}>
                            <MaterialIcons name="account-tree" size={24} color={colors.primary.main} />
                            <View style={styles.processTitleContainer}>
                                <Text style={styles.processTitle}>{processData.process.name}</Text>
                                {processData.process.description && (
                                    <Text style={styles.processDescription}>{processData.process.description}</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.phasesSection}>
                            <Text style={styles.subsectionTitle}>Phases</Text>
                            {processData.process.phases.length === 0 ? (
                                <Text style={styles.emptyText}>No phases in current process</Text>
                            ) : (
                                processData.process.phases.slice().sort((a, b) => a.order - b.order).map((phase) => (
                                    <TouchableOpacity 
                                        key={phase.id} 
                                        style={styles.phaseItem} 
                                        onPress={() => navigation.navigate('Phase', { id: phase.id, process: processData.process, project: projectData.project })}
                                    >
                                        <View style={styles.phaseNumber}>
                                            <Text style={styles.phaseNumberText}>{phase.order}</Text>
                                        </View>
                                        <View style={styles.phaseContent}>
                                            <Text style={styles.phaseName}>{phase.name}</Text>
                                            {phase.description && <Text style={styles.phaseDescription}>{phase.description}</Text>}
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color={colors.neutral[400]} />
                                    </TouchableOpacity>
                                ))
                            )}
                            {(userData.id === projectData.project.owner.id) && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    fullWidth
                                    onPress={() => navigation.navigate('CreatePhase', { process: processData.process, project: projectData.project })}
                                    icon={<MaterialIcons name="add" size={20} color={colors.primary.main} />}
                                    style={styles.addButton}
                                >
                                    Add New Phase
                                </Button>
                            )}
                        </View>
                    </Card>
                )}
                
                {projectData && processData && (
                    <Card style={styles.membersCard}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="people" size={24} color={colors.primary.main} />
                            <Text style={styles.subsectionTitle}>Project Members</Text>
                        </View>
                        {projectData.project.members.length === 0 ? (
                            <Text style={styles.emptyText}>No members in project</Text>
                        ) : (
                            <View style={styles.membersList}>
                                {projectData.project.members.map((member) => (
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
                        {userData.id === projectData.project.owner.id && (
                            <Button
                                variant="outline"
                                size="md"
                                fullWidth
                                onPress={() => navigation.navigate('InviteUsers', { project: projectData.project })}
                                icon={<MaterialIcons name="person-add" size={20} color={colors.primary.main} />}
                                style={styles.addButton}
                            >
                                Invite/Remove Members
                            </Button>
                        )}
                    </Card>
                )}
                {projectData && userData.id === projectData.project.owner.id && (
                    <View style={styles.actionsContainer}>
                        {processData && (
                            <>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onPress={() => navigation.navigate('EditProcess', { project: projectData.project, process: processData.process })}
                                    icon={<MaterialIcons name="edit" size={20} color={colors.text.inverse} />}
                                >
                                    Edit Process
                                </Button>
                                <Button
                                    variant="danger"
                                    size="lg"
                                    fullWidth
                                    onPress={() => {
                                        Alert.alert(
                                            'Delete Process',
                                            'Are you sure you want to delete this process?',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { 
                                                    text: 'Delete',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        try {
                                                            await deleteProcess({ variables: { id: processData.process.id } });
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
                                    Delete Process
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            size="lg"
                            fullWidth
                            onPress={() => navigation.navigate('EditProject', { project: projectData.project })}
                            icon={<MaterialIcons name="edit" size={20} color={colors.primary.main} />}
                            style={styles.actionButton}
                        >
                            Edit Project
                        </Button>
                        <Button
                            variant="danger"
                            size="lg"
                            fullWidth
                            onPress={() => {
                                Alert.alert(
                                    'Delete Project',
                                    'Are you sure you want to delete this project?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { 
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await deleteProject({ variables: { id: projectData.project.id } });
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
                            Delete Project
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
    projectCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    projectTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        flex: 1,
        marginRight: spacing.sm,
    },
    projectDescription: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    },
    processSection: {
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    processListContent: {
        gap: spacing.sm,
    },
    processTab: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.white,
        borderRadius: borderRadius.lg,
        marginRight: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    processTabActive: {
        backgroundColor: colors.primary.main,
        shadowColor: colors.primary.main,
        shadowOpacity: 0.3,
        elevation: 3,
    },
    processTabText: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.medium,
    },
    processTabTextActive: {
        color: colors.text.inverse,
    },
    addProcessTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.white,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    processCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    processTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    processTitleContainer: {
        flex: 1,
    },
    processTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    processDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    phasesSection: {
        marginTop: spacing.md,
    },
    subsectionTitle: {
        fontSize: typography.fontSize.base,
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
    phaseItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    phaseNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    phaseNumberText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
    },
    phaseContent: {
        flex: 1,
        paddingTop: spacing.xs,
    },
    phaseName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    phaseDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
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
        gap: spacing.md,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    memberUsername: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    addButton: {
        marginTop: spacing.sm,
    },
    actionsContainer: {
        gap: spacing.md,
    },
    actionButton: {
        marginTop: 0,
    },
})

export default ProjectScreen;
