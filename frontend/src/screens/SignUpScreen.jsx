import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GET_PRESIGNED_URL_MUTATION } from '../graphql/Mutations';
import { useMutation, useLazyQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';
import { RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { signUp, signIn, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { GET_USER_PROFILE_QUERY } from '../graphql/Queries';
import { Button, TextInput, Card } from '../components';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const SignUpScreen = ({navigation}) => {
    const { userData, setUserData } = UserGlobalState();
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [primaryEmail, setPrimaryEmail] = useState('');
    const [secondaryEmail, setSecondaryEmail] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imageUploaded, setImageUploaded] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [tempCredentials, setTempCredentials] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [getPresignedURL] = useMutation(GET_PRESIGNED_URL_MUTATION);
    const [getUserProfile] = useLazyQuery(GET_USER_PROFILE_QUERY);

    const handleUploadFile = async () => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 3],
            quality: 1
        };
        try {
            let result = await ImagePicker.launchImageLibraryAsync(options);
            const parts = result.assets[0].fileName.split('.');
            if (parts.length !== 2) {
                throw new Error("invalid file");
            }
            const response = await getPresignedURL({
                variables: {
                    filetype: parts[1]
                }
            });
            const presignedURL = response.data.getPresignedURL;
            setImageURL(presignedURL);
            const resp = await fetch(result.assets[0].uri);
            const imageBody = await resp.blob();
            const uploadResponse = await fetch(presignedURL, {
                method: 'PUT',
                body: imageBody
            });
            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }
            setImageUploaded(true);
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    }

    const validateForm = () => {
        const newErrors = {};
        
        if (!primaryEmail) {
            newErrors.primaryEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(primaryEmail)) {
            newErrors.primaryEmail = 'Email is invalid';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!firstName) newErrors.firstName = 'First name is required';
        if (!lastName) newErrors.lastName = 'Last name is required';
        if (!country) newErrors.country = 'Country is required';
        if (!gender) newErrors.gender = 'Please select a gender';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <MaterialIcons name="person-add" size={48} color={colors.secondary.main} />
                        </View>
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join us today</Text>
                </View>

                <Card style={styles.formCard}>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={primaryEmail}
                        onChangeText={(text) => {
                            setPrimaryEmail(text);
                            setErrors({ ...errors, primaryEmail: '' });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<MaterialIcons name="email" size={20} color={colors.neutral[500]} />}
                        error={errors.primaryEmail}
                    />
                    
                    <TextInput
                        label="Password"
                        placeholder="At least 8 characters"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setErrors({ ...errors, password: '' });
                        }}
                        leftIcon={<MaterialIcons name="lock" size={20} color={colors.neutral[500]} />}
                        error={errors.password}
                    />
                    
                    <View style={styles.nameRow}>
                        <View style={styles.nameInput}>
                            <TextInput
                                label="First Name"
                                placeholder="John"
                                value={firstName}
                                onChangeText={(text) => {
                                    setFirstName(text);
                                    setErrors({ ...errors, firstName: '' });
                                }}
                                leftIcon={<MaterialIcons name="person" size={20} color={colors.neutral[500]} />}
                                error={errors.firstName}
                            />
                        </View>
                        <View style={styles.nameInput}>
                            <TextInput
                                label="Last Name"
                                placeholder="Doe"
                                value={lastName}
                                onChangeText={(text) => {
                                    setLastName(text);
                                    setErrors({ ...errors, lastName: '' });
                                }}
                                error={errors.lastName}
                            />
                        </View>
                    </View>
                    
                    <TextInput
                        label="Country"
                        placeholder="Enter your country"
                        value={country}
                        onChangeText={(text) => {
                            setCountry(text);
                            setErrors({ ...errors, country: '' });
                        }}
                        leftIcon={<MaterialIcons name="public" size={20} color={colors.neutral[500]} />}
                        error={errors.country}
                    />
                    
                    <TextInput
                        label="Secondary Email (Optional)"
                        placeholder="Alternate email"
                        value={secondaryEmail}
                        onChangeText={setSecondaryEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<MaterialIcons name="alternate-email" size={20} color={colors.neutral[500]} />}
                    />
                    <View style={styles.genderSection}>
                        <Text style={styles.genderLabel}>Gender</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity 
                                style={[styles.radioButton, gender === 'Male' && styles.radioButtonActive]}
                                onPress={() => {
                                    setGender('Male');
                                    setErrors({ ...errors, gender: '' });
                                }}
                            >
                                <MaterialIcons 
                                    name="check-circle" 
                                    size={20} 
                                    color={gender === 'Male' ? colors.primary.main : colors.neutral[300]} 
                                />
                                <Text style={[styles.radioLabel, gender === 'Male' && styles.radioLabelActive]}>
                                    Male
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.radioButton, gender === 'Female' && styles.radioButtonActive]}
                                onPress={() => {
                                    setGender('Female');
                                    setErrors({ ...errors, gender: '' });
                                }}
                            >
                                <MaterialIcons 
                                    name="check-circle" 
                                    size={20} 
                                    color={gender === 'Female' ? colors.primary.main : colors.neutral[300]} 
                                />
                                <Text style={[styles.radioLabel, gender === 'Female' && styles.radioLabelActive]}>
                                    Female
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                    </View>

                    <Button
                        variant={imageUploaded ? "secondary" : "outline"}
                        size="md"
                        fullWidth
                        onPress={handleUploadFile}
                        icon={<MaterialIcons name={imageUploaded ? "check" : "cloud-upload"} size={20} color={imageUploaded ? colors.text.inverse : colors.primary.main} />}
                        style={styles.uploadButton}
                    >
                        {imageUploaded ? 'Image Uploaded' : 'Upload Profile Image'}
                    </Button>
                    {showVerification && (
                        <View style={styles.verificationSection}>
                            <TextInput
                                label="Verification Code"
                                placeholder="Enter 6-digit code"
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                keyboardType="number-pad"
                                leftIcon={<MaterialIcons name="verified-user" size={20} color={colors.neutral[500]} />}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={async () => {
                                    try {
                                        await resendSignUpCode({ username: tempCredentials.username });
                                        Alert.alert('Success', 'Verification code resent to your email');
                                    } catch (err) {
                                        Alert.alert('Error', err.message);
                                    }
                                }}
                                style={styles.resendButton}
                            >
                                Resend Code
                            </Button>
                        </View>
                    )}

                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        onPress={
                        async () => {
                            if (!showVerification && !validateForm()) return;
                            
                            setLoading(true);
                            try {
                                if (showVerification) {
                                    // Confirm signup with verification code
                                    try {
                                        await confirmSignUp({
                                            username: tempCredentials.username,
                                            confirmationCode: verificationCode
                                        });
                                        
                                        Alert.alert(
                                            'Success!', 
                                            'Your account has been verified. Please login to continue.',
                                            [
                                                {
                                                    text: 'OK',
                                                    onPress: () => navigation.navigate('Login')
                                                }
                                            ]
                                        );
                                    } catch (confirmError) {
                                        if (confirmError.name === 'NotAuthorizedException' && confirmError.message.includes('CONFIRMED')) {
                                            Alert.alert(
                                                'Already Verified', 
                                                'Your account is already verified. Please login.',
                                                [
                                                    {
                                                        text: 'OK',
                                                        onPress: () => navigation.navigate('Login')
                                                    }
                                                ]
                                            );
                                        } else {
                                            throw confirmError;
                                        }
                                    }
                                } else {
                                    // Initial signup
                                    const { isSignUpComplete } = await signUp({
                                        username: primaryEmail,
                                        password,
                                        options: {
                                            userAttributes: {
                                                email: primaryEmail
                                            }
                                        }
                                    });
                                    
                                    if (!isSignUpComplete) {
                                        setTempCredentials({ username: primaryEmail, password, firstName, lastName, gender, country, secondaryEmail, imageURL });
                                        setShowVerification(true);
                                        Alert.alert('Verification Required', 'Please check your email for the verification code and enter it below.');
                                    }
                                }
                            } catch (err) {
                                console.error('Signup error:', err);
                                const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
                                Alert.alert('Error', message);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {showVerification ? 'Verify Account' : 'Create Account'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginButton}
                    >
                        Already have an account? Login
                    </Button>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondary[50],
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing['2xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
        marginTop: spacing.lg,
    },
    logoContainer: {
        marginBottom: spacing.lg,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.background.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.secondary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.normal,
    },
    formCard: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        paddingVertical: spacing.xl,
        borderWidth: 0,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    nameInput: {
        flex: 1,
    },
    genderSection: {
        marginBottom: spacing.md,
    },
    genderLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    radioButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 0,
        backgroundColor: colors.background.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    radioButtonActive: {
        backgroundColor: colors.primary[100],
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    radioLabel: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginLeft: spacing.sm,
    },
    radioLabelActive: {
        color: colors.primary.main,
        fontWeight: typography.fontWeight.medium,
    },
    errorText: {
        fontSize: typography.fontSize.sm,
        color: colors.status.error,
        marginTop: spacing.xs,
    },
    uploadButton: {
        marginVertical: spacing.md,
    },
    verificationSection: {
        marginBottom: spacing.md,
    },
    resendButton: {
        marginTop: spacing.xs,
    },
    loginButton: {
        marginTop: spacing.md,
    },
});

export default SignUpScreen;
