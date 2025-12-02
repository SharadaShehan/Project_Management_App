import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_PHASE_MEMBERS_MUTATION, REMOVE_PHASE_MEMBERS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const UpdatePhaseMembers = ({ navigation, route }) => {
    const phaseId = route.params?.phase?.id;
    
    if (!phaseId) {
        Alert.alert('Error', 'Invalid phase');
        navigation.goBack();
        return null;
    }
    const currentPhaseMembers = route.params.phase.phaseMembers || [];
    const projectMembers = route.params.project.members;
    const [phaseMembersToAdd, setPhaseMembersToAdd] = useState([]);
    const [phaseMembersToRemove, setPhaseMembersToRemove] = useState([]);
    const [shownPhaseMembers, setShownPhaseMembers] = useState([]);
    const [shownNonPhaseMembers, setShownNonPhaseMembers] = useState([]);
    const [addPhaseMembers] = useMutation(ADD_PHASE_MEMBERS_MUTATION);
    const [removePhaseMembers] = useMutation(REMOVE_PHASE_MEMBERS_MUTATION);

    useEffect(() => {
        setShownPhaseMembers([...phaseMembersToAdd, ...currentPhaseMembers].filter(manager => !phaseMembersToRemove.some(m => m.id === manager.id)));
        const tempManagers = [...phaseMembersToAdd, ...currentPhaseMembers].filter(manager => !phaseMembersToRemove.some(m => m.id === manager.id));
        setShownNonPhaseMembers(projectMembers.filter(member => !tempManagers.some(manager => manager.id === member.id)));
    }, [phaseMembersToAdd, phaseMembersToRemove]);
    
    const updatePhaseMembersHandler = async () => {
        try {
            if (!phaseId ) {
                Alert.alert('Phase not found');
                return;
            } else if (phaseMembersToAdd.length === 0 && phaseMembersToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (phaseMembersToAdd.length > 0) {
                    const response = await addPhaseMembers({ variables: { id: phaseId, members: phaseMembersToAdd.map(manager => manager.id) } });
                    if (!response?.data?.addPhaseMembers?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (phaseMembersToRemove.length > 0) {
                    const response = await removePhaseMembers({ variables: { id: phaseId, members: phaseMembersToRemove.map(manager => manager.id) } });
                    if (!response?.data?.removePhaseMembers?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Phase Members Updated');
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

    const renderPhaseMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (phaseMembersToAdd.some(manager => manager.id === item.id)) {
                    setPhaseMembersToAdd(phaseMembersToAdd.filter(manager => manager.id !== item.id));
                } else {
                    setPhaseMembersToRemove([...phaseMembersToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderProjectMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (phaseMembersToRemove.some(manager => manager.id === item.id)) {
                    setPhaseMembersToRemove(phaseMembersToRemove.filter(manager => manager.id !== item.id));
                } else {
                    setPhaseMembersToAdd([...phaseMembersToAdd, item]);
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
                    <Text style={styles.title}>Update Phase Members</Text>
                    
                    <View style={styles.membersSection}>
                        <Text style={styles.sectionTitle}>Current Phase Members</Text>
                        {shownPhaseMembers.length === 0 ? (
                            <Text style={styles.emptyText}>No members yet</Text>
                        ) : (
                            <FlatList
                                data={shownPhaseMembers}
                                renderItem={renderPhaseMemberItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                    
                    <View style={styles.availableSection}>
                        <Text style={styles.sectionTitle}>Add from Project Members</Text>
                        <FlatList
                            data={shownNonPhaseMembers}
                            renderItem={renderProjectMemberItem}
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
                            onPress={updatePhaseMembersHandler}
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
    membersSection: {
        marginBottom: spacing.lg,
    },
    availableSection: {
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

export default UpdatePhaseMembers;
