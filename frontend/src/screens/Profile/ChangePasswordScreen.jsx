import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CHANGE_PASSWORD_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [changePassword, { data, loading, error }] = useMutation(CHANGE_PASSWORD_MUTATION);

    const changePasswordhandler = async () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Passwords do not match');
            return;
        }
        try {
            const response = await changePassword({
                variables: {
                    currentPassword,
                    newPassword
                }
            });
            if (response.data.changePassword) {
                Alert.alert('Password changed successfully');
                navigation.navigate('Profile');
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (error) {
            console.log(error);
            Alert.alert(error.message);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Change Password</Text>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Current Password</Text>
                        <TextInput
                            placeholder="Enter current password"
                            value={currentPassword}
                            secureTextEntry
                            onChangeText={setCurrentPassword}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            placeholder="Enter new password"
                            value={newPassword}
                            secureTextEntry
                            onChangeText={setNewPassword}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <TextInput
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            secureTextEntry
                            onChangeText={setConfirmNewPassword}
                        />
                    </View>
                    
                    <View style={styles.buttonRow}>
                        <Button
                            variant="outline"
                            onPress={() => navigation.navigate('Profile')}
                            style={styles.actionButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={changePasswordhandler}
                            style={styles.actionButton}
                        >
                            Update Password
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
        justifyContent: 'center',
        flexGrow: 1,
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
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    actionButton: {
        flex: 1,
    },
});


export default ChangePasswordScreen;
