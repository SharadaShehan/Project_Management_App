import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { UPDATE_PROFILE_MUTATION, GET_PRESIGNED_URL_MUTATION } from '../queries/Mutations';
import { useMutation, useQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';
import { Button, RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

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
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Profile</Text>
                <View style={styles.inputContainer}>
                    <View style={styles.rowContainer}>
                        <Text style={styles.descriptionText}>
                            First Name
                        </Text>
                        <TextInput
                            style={styles.shortInput}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={(text) => setFirstName(text)}
                        />
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={styles.descriptionText}>
                            Last Name
                        </Text>
                        <TextInput
                            style={styles.shortInput}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={(text) => setLastName(text)}
                        />
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={styles.descriptionText}>
                            Country
                        </Text>
                        <TextInput
                            style={styles.shortInput}
                            placeholder="Country"
                            value={country}
                            onChangeText={(text) => setCountry(text)}
                        />
                    </View>
                    <Text style={styles.emailText}> Email Addresses </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Primary Email"
                        value={primaryEmail}
                        onChangeText={(text) => setPrimaryEmail(text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Secondary Email"
                        value={secondaryEmail}
                        onChangeText={(text) => setSecondaryEmail(text)}
                    />
                    {localImage && <Image source={{ uri: localImage }} style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 10 }} />}
                    <TouchableOpacity style={[styles.uploadButton, imageUploaded ? { backgroundColor: 'green' } : { backgroundColor: '#007BFF' }]} onPress={handleUploadFile} disabled={!uploadButtonEnabled}>
                        <Text style={styles.buttonText}>{imageUploaded ? 'Image Uploaded ✔' : '📤 Upload Image'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.rowButtonsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={
                    async () => {
                        try {
                            let variables = {};
                            if (firstName) variables.firstName = firstName;
                            if (lastName) variables.lastName = lastName;
                            if (country) variables.country = country;
                            if (primaryEmail) variables.primaryEmail = primaryEmail;
                            if (secondaryEmail) variables.secondaryEmail = secondaryEmail;
                            if (imageURL) variables.imageURL = imageURL;
                            
                            const response = await updateProfile({ variables: variables });
                            if (response.data.updateProfile.firstName) {
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
                                navigation.navigate('Profile');
                            } else {
                                alert('Invalid Details');
                            }
                        } catch (err) {
                            // separate each sentence into new line in err.message
                            const message = err.message.split('.').join('.\n');
                            Alert.alert('Error', message);
                        }
                    }
                }>
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '85%',
        borderRadius: 40,
        backgroundColor: 'white',
        paddingHorizontal: '4%',
        marginTop: '5%',
    },
    title: {
        fontSize: 24,
        marginTop: '12%',
        textAlign: 'center',
        color: '#007BFF',
        fontWeight: 'bold',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    descriptionText: {
        fontSize: 16,
        width: '30%',
        marginTop: '4%',
        fontWeight: 'semibold',
    },
    shortInput: {
        width: '45%',
        height: 35,
        borderColor: '#007BFF',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        // borderRadius: 10,
        marginBottom: '5%',
        padding: 5,
    },
    emailText: {
        fontSize: 16,
        marginTop: '4%',
        marginBottom: '3%',
        fontWeight: 'semibold',
    },
    inputContainer: {
        marginTop: '5%',
        alignItems: 'center',
        marginBottom: '6%',
    },
    input: {
        width: '80%',
        height: 35,
        borderColor: '#007BFF',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        // borderRadius: 10,
        marginBottom: '5%',
        padding: 5,
    },
    uploadButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignSelf: 'center',
        marginTop: '4%',
    },
    rowButtonsContainer: {
        marginTop: '2%',
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '44%',
        alignSelf: 'center',
        marginHorizontal: '3%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioTitle: {
        fontSize: 16,
        color: '#007BFF',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioLabel: {
        fontSize: 16,
        marginLeft: 0,
        color: '#007BFF',
    },
    subText: {
        marginTop: 12,
        color: '#007BFF',
        textAlign: 'center',
    },
});

export default UpdateProfileScreen;
