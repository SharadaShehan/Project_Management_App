import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_PROCESS_MANAGERS_MUTATION, REMOVE_PROCESS_MANAGERS_MUTATION } from '../../graphql/Mutations';
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

const UpdateProcessManagers = ({ navigation, route }) => {
    const processId = route.params?.process?.id;
    
    if (!processId) {
        Alert.alert('Error', 'Invalid process');
        navigation.goBack();
        return null;
    }
    const currentManagers = route.params.process.managers || [];
    const projectMembers = route.params.projectMembers;
    const [managersToAdd, setManagersToAdd] = useState([]);
    const [managersToRemove, setManagersToRemove] = useState([]);
    const [shownManagers, setShownManagers] = useState([]);
    const [shownNonManagers, setShownNonManagers] = useState([]);
    const [addProcessManagers] = useMutation(ADD_PROCESS_MANAGERS_MUTATION);
    const [removeProcessManagers] = useMutation(REMOVE_PROCESS_MANAGERS_MUTATION);

    useEffect(() => {
        setShownManagers([...managersToAdd, ...currentManagers].filter(manager => !managersToRemove.some(m => m.id === manager.id)));
        const tempManagers = [...managersToAdd, ...currentManagers].filter(manager => !managersToRemove.some(m => m.id === manager.id));
        setShownNonManagers(projectMembers.filter(member => !tempManagers.some(manager => manager.id === member.id)));
    }, [managersToAdd, managersToRemove]);
    
    const updateProcessManagersHandler = async () => {
        try {
            if (!processId ) {
                Alert.alert('Process not found');
                return;
            } else if (managersToAdd.length === 0 && managersToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (managersToAdd.length > 0) {
                    const response = await addProcessManagers({ variables: { id: processId, managers: managersToAdd.map(manager => manager.id) } });
                    if (!response?.data?.addProcessManagers?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (managersToRemove.length > 0) {
                    const response = await removeProcessManagers({ variables: { id: processId, managers: managersToRemove.map(manager => manager.id) } });
                    if (!response?.data?.removeProcessManagers?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Process Managers Updated');
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

    const renderManagerItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (managersToAdd.some(manager => manager.id === item.id)) {
                    setManagersToAdd(managersToAdd.filter(manager => manager.id !== item.id));
                } else {
                    setManagersToRemove([...managersToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (managersToRemove.some(manager => manager.id === item.id)) {
                    setManagersToRemove(managersToRemove.filter(manager => manager.id !== item.id));
                } else {
                    setManagersToAdd([...managersToAdd, item]);
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
                    <Text style={styles.title}>Update Process Managers</Text>
                    
                    <View style={styles.managersSection}>
                        <Text style={styles.sectionTitle}>Current Managers</Text>
                        {shownManagers.length === 0 ? (
                            <Text style={styles.emptyText}>No managers yet</Text>
                        ) : (
                            <FlatList
                                data={shownManagers}
                                renderItem={renderManagerItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                    
                    <View style={styles.availableSection}>
                        <Text style={styles.sectionTitle}>Add from Project Members</Text>
                        <FlatList
                            data={shownNonManagers}
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
                            onPress={updateProcessManagersHandler}
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
    managersSection: {
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

export default UpdateProcessManagers;
