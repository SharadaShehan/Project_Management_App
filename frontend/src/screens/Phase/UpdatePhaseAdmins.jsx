import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_PHASE_ADMINS_MUTATION, REMOVE_PHASE_ADMINS_MUTATION } from '../../graphql/Mutations';
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

const UpdatePhaseAdmins = ({ navigation, route }) => {
    const phaseId = route.params?.phase?.id;
    
    if (!phaseId) {
        Alert.alert('Error', 'Invalid phase');
        navigation.goBack();
        return null;
    }
    const currenAdmins = route.params.phase.phaseAdmins || [];
    const phaseMembers = route.params.phase.phaseMembers || [];
    const [adminsToAdd, setAdminsToAdd] = useState([]);
    const [adminsToRemove, setAdminsToRemove] = useState([]);
    const [shownAdmins, setShownAdmins] = useState([]);
    const [shownNonAdmins, setShownNonAdmins] = useState([]);
    const [addPhaseAdmins] = useMutation(ADD_PHASE_ADMINS_MUTATION);
    const [removePhaseAdmins] = useMutation(REMOVE_PHASE_ADMINS_MUTATION);

    useEffect(() => {
        setShownAdmins([...adminsToAdd, ...currenAdmins].filter(manager => !adminsToRemove.some(m => m.id === manager.id)));
        const tempAdmins = [...adminsToAdd, ...currenAdmins].filter(manager => !adminsToRemove.some(m => m.id === manager.id));
        setShownNonAdmins(phaseMembers.filter(member => !tempAdmins.some(manager => manager.id === member.id)));
    }, [adminsToAdd, adminsToRemove]);
    
    const updatePhaseAdminsHandler = async () => {
        try {
            if (!phaseId ) {
                Alert.alert('Phase not found');
                return;
            } else if (adminsToAdd.length === 0 && adminsToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (adminsToAdd.length > 0) {
                    const response = await addPhaseAdmins({ variables: { id: phaseId, admins: adminsToAdd.map(admin => admin.id) } });
                    if (!response?.data?.addPhaseAdmins?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (adminsToRemove.length > 0) {
                    const response = await removePhaseAdmins({ variables: { id: phaseId, admins: adminsToRemove.map(admin => admin.id) } });
                    if (!response?.data?.removePhaseAdmins?.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Phase Admins Updated');
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

    const renderAdminItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (adminsToAdd.some(admin => admin.id === item.id)) {
                    setAdminsToAdd(adminsToAdd.filter(admin => admin.id !== item.id));
                } else {
                    setAdminsToRemove([...adminsToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (adminsToRemove.some(admin => admin.id === item.id)) {
                    setAdminsToRemove(adminsToRemove.filter(admin => admin.id !== item.id));
                } else {
                    setAdminsToAdd([...adminsToAdd, item]);
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
                    <Text style={styles.title}>Update Phase Admins</Text>
                    
                    <View style={styles.adminsSection}>
                        <Text style={styles.sectionTitle}>Current Phase Admins</Text>
                        {shownAdmins.length === 0 ? (
                            <Text style={styles.emptyText}>No admins yet</Text>
                        ) : (
                            <FlatList
                                data={shownAdmins}
                                renderItem={renderAdminItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                    
                    <View style={styles.availableSection}>
                        <Text style={styles.sectionTitle}>Add from Phase Members</Text>
                        <FlatList
                            data={shownNonAdmins}
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
                            onPress={updatePhaseAdminsHandler}
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
    adminsSection: {
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

export default UpdatePhaseAdmins;
