import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserGlobalState } from '../../layout/UserState';
import { Button, Card, Avatar } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const ProfileScreen = ({ navigation }) => {
    const { userData, setUserData } = UserGlobalState();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Card style={styles.profileCard}>
                <View style={styles.avatarSection}>
                    <Avatar 
                        source={userData.imageURL ? { uri: userData.imageURL } : require('../../../images/profile.webp')}
                        name={`${userData.firstName} ${userData.lastName}`}
                        size="2xl"
                    />
                    <Text style={styles.fullNameText}>{userData.firstName} {userData.lastName}</Text>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelContainer}>
                            <MaterialIcons name="person" size={20} color={colors.primary.main} />
                            <Text style={styles.infoLabel}>Gender</Text>
                        </View>
                        <Text style={userData.gender ? styles.infoValue : styles.infoValueNotSet}>
                            {userData.gender || 'Not set'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelContainer}>
                            <MaterialIcons name="public" size={20} color={colors.primary.main} />
                            <Text style={styles.infoLabel}>Country</Text>
                        </View>
                        <Text style={userData.country ? styles.infoValue : styles.infoValueNotSet}>
                            {userData.country || 'Not set'}
                        </Text>
                    </View>

                    {(userData.primaryEmail || userData.secondaryEmail) && (
                        <View style={styles.emailSection}>
                            <View style={styles.emailHeader}>
                                <MaterialIcons name="email" size={20} color={colors.primary.main} />
                                <Text style={styles.emailTitle}>Email Addresses</Text>
                            </View>
                            {userData.primaryEmail && (
                                <Text style={styles.emailValue}>{userData.primaryEmail}</Text>
                            )}
                            {userData.secondaryEmail && (
                                <Text style={styles.emailValue}>{userData.secondaryEmail}</Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.buttonsContainer}>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={() => navigation.navigate('UpdateProfile')}
                        icon={<MaterialIcons name="edit" size={20} color={colors.text.inverse} />}
                        style={styles.actionButton}
                    >
                        Update Profile
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        onPress={() => navigation.navigate('ChangePassword')}
                        icon={<MaterialIcons name="lock" size={20} color={colors.primary.main} />}
                        style={styles.actionButton}
                    >
                        Change Password
                    </Button>
                </View>
            </Card>

            <Button
                variant="secondary"
                size="lg"
                fullWidth
                onPress={() => navigation.navigate('ViewInvitations')}
                icon={<MaterialIcons name="mail" size={20} color={colors.text.inverse} />}
                style={styles.invitationButton}
            >
                View Invitations
            </Button>
        </ScrollView>
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
    profileCard: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        borderWidth: 0,
        marginBottom: spacing.md,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    fullNameText: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    infoSection: {
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    infoLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    infoLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
    },
    infoValue: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'right',
    },
    infoValueNotSet: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[400],
        fontStyle: 'italic',
        textAlign: 'right',
    },
    emailSection: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    emailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    emailTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
    },
    emailValue: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginLeft: spacing.lg + spacing.sm,
        marginTop: spacing.xs,
    },
    buttonsContainer: {
        gap: spacing.sm,
    },
    actionButton: {
    },
    invitationButton: {
        maxWidth: 500,
        alignSelf: 'center',
    },
})


export default ProfileScreen;