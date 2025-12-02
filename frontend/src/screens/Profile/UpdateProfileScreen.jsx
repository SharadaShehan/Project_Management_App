import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UPDATE_PROFILE_MUTATION, GET_PRESIGNED_URL_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const UpdateProfileScreen = ({navigation}) => {
    const { userData, setUserData } = UserGlobalState();
    const [firstName, setFirstName] = useState(userData.firstName ? userData.firstName : '');
    const [lastName, setLastName] = useState(userData.lastName ? userData.lastName : '');
    const [country, setCountry] = useState(userData.country ? userData.country : '');
    const [primaryEmail, setPrimaryEmail] = useState(userData.primaryEmail ? userData.primaryEmail : '');
    const [secondaryEmail, setSecondaryEmail] = useState(userData.secondaryEmail ? userData.secondaryEmail : '');
    const [imageURL, setImageURL] = useState('');
    const [localImage, setLocalImage] = useState(userData.imageURL ? userData.imageURL : '');
    const [imageUploaded, setImageUploaded] = useState(false);
    const [uploadButtonEnabled, setUploadButtonEnabled] = useState(true);
    const [updateProfile, { data: updateProfileData, loading: updateProfileLoading, error: updateProfileError }] = useMutation(UPDATE_PROFILE_MUTATION);
    const [getPresignedURL, { data: presignedURLData, loading: presignedURLLoading, error: presignedURLError }] = useMutation(GET_PRESIGNED_URL_MUTATION);

    const handleUploadFile = async () => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 3],
            quality: 1
        };
        try { 
            let result = await ImagePicker.launchImageLibraryAsync(options);
            if (result.canceled) {
                return;
            }
            setImageUploaded(false);
            setUploadButtonEnabled(false);
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
            setUploadButtonEnabled(true);
            setLocalImage(result.assets[0].uri);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Update Profile</Text>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            placeholder="Enter first name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            placeholder="Enter last name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Country</Text>
                        <TextInput
                            placeholder="Enter country"
                            value={country}
                            onChangeText={setCountry}
                        />
                    </View>
                    
                    <View style={styles.emailSection}>
                        <Text style={styles.sectionTitle}>Email Addresses</Text>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Primary Email</Text>
                            <TextInput
                                placeholder="Enter primary email"
                                value={primaryEmail}
                                onChangeText={setPrimaryEmail}
                                keyboardType="email-address"
                            />
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Secondary Email</Text>
                            <TextInput
                                placeholder="Enter secondary email"
                                value={secondaryEmail}
                                onChangeText={setSecondaryEmail}
                                keyboardType="email-address"
                            />
                        </View>
                    </View>
                    
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>Profile Picture</Text>
                        {localImage && (
                            <Image source={{ uri: localImage }} style={styles.profileImage} />
                        )}
                        <Button
                            variant={imageUploaded ? "primary" : "outline"}
                            onPress={handleUploadFile}
                            disabled={!uploadButtonEnabled}
                            style={styles.uploadButton}
                        >
                            <View style={styles.uploadButtonContent}>
                                <MaterialIcons 
                                    name={imageUploaded ? "check-circle" : "cloud-upload"} 
                                    size={20} 
                                    color={imageUploaded ? colors.neutral.white : colors.primary.main} 
                                />
                                <Text style={[styles.uploadButtonText, imageUploaded && styles.uploadButtonTextSuccess]}>
                                    {imageUploaded ? 'Image Uploaded' : 'Upload Image'}
                                </Text>
                            </View>
                        </Button>
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
                            onPress={async () => {
                                try {
                                    let variables = {};
                                    if (firstName) variables.firstName = firstName;
                                    if (lastName) variables.lastName = lastName;
                                    if (country) variables.country = country;
                                    if (primaryEmail) variables.primaryEmail = primaryEmail;
                                    if (secondaryEmail) variables.secondaryEmail = secondaryEmail;
                                    if (imageURL) variables.imageURL = imageURL;
                                    
                                    const response = await updateProfile({ variables: variables });
                                    if (response?.data?.updateProfile?.firstName) {
                                        setUserData({
                                            id: response.data.updateProfile.id,
                                            username: response.data.updateProfile.username,
                                            firstName: response.data.updateProfile.firstName,
                                            lastName: response.data.updateProfile.lastName,
                                            gender: response.data.updateProfile.gender,
                                            country: response.data.updateProfile.country,
                                            primaryEmail: response.data.updateProfile.primaryEmail,
                                            secondaryEmail: response.data.updateProfile.secondaryEmail,
                                            imageURL: response.data.updateProfile.imageURL,
                                            wsToken: userData.wsToken,
                                        });
                                        Alert.alert('Success', 'Profile updated successfully');
                                        navigation.navigate('Profile');
                                    } else {
                                        Alert.alert('Error', 'An error occurred, please try again');
                                    }
                                } catch (err) {
                                    const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
                                    Alert.alert('Error', message);
                                }
                            }}
                            style={styles.actionButton}
                        >
                            Update Profile
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
    emailSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    imageSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
        lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.full,
        marginBottom: spacing.md,
    },
    uploadButton: {
        width: '100%',
    },
    uploadButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    uploadButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.primary.main,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    uploadButtonTextSuccess: {
        color: colors.neutral.white,
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

export default UpdateProfileScreen;
