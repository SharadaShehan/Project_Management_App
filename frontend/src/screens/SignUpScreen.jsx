import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SIGNUP_MUTATION, GET_PRESIGNED_URL_MUTATION } from '../queries/Mutations';
import { useMutation, useQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';
import { Button, RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const SignUpScreen = ({navigation}) => {
    const { userData, setUserData } = UserGlobalState();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [primaryEmail, setPrimaryEmail] = useState('');
    const [secondaryEmail, setSecondaryEmail] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imageUploaded, setImageUploaded] = useState(false);
    const [signUp, { data, loading, error }] = useMutation(SIGNUP_MUTATION);
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

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Sign Up</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={(text) => setUsername(text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={(text) => setFirstName(text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={(text) => setLastName(text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Country"
                        value={country}
                        onChangeText={(text) => setCountry(text)}
                    />
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
                    <View style={styles.radioGroup}>
                        <Text style={styles.radioTitle}>
                            Gender :
                        </Text>
                        <View style={styles.radioButton}> 
                            <RadioButton.Android 
                                value="Male"
                                status={gender === 'Male' ? 'checked' : 'unchecked'} 
                                onPress={() => setGender('Male')}
                                color="#007BFF"
                            /> 
                            <Text style={styles.radioLabel}> 
                                Male
                            </Text> 
                        </View> 
        
                        <View style={styles.radioButton}>
                            <RadioButton.Android
                                value="Female"
                                status={gender === 'Female' ? 'checked' : 'unchecked'}
                                onPress={() => setGender('Female')}
                                color="#007BFF"
                            />
                            <Text style={styles.radioLabel}>
                                Female
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.uploadButton, imageUploaded ? { backgroundColor: 'green' } : { backgroundColor: '#007BFF' }]} onPress={handleUploadFile}>
                        <Text style={styles.buttonText}>{imageUploaded ? 'Image Uploaded ✔' : '📤 Upload Image'}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={
                    async () => {
                        try {
                            let variables = {}
                            if (username) variables.username = username;
                            if (password) variables.password = password;
                            if (firstName) variables.firstName = firstName;
                            if (lastName) variables.lastName = lastName;
                            if (gender) variables.gender = gender;
                            if (country) variables.country = country;
                            if (primaryEmail) variables.primaryEmail = primaryEmail;
                            if (secondaryEmail) variables.secondaryEmail = secondaryEmail;
                            if (imageURL) variables.imageURL = imageURL;

                            const response = await signUp({ variables: variables });
                            if (response.data.signUp.firstName) {
                                setUserData({
                                    id: response.data.signUp.id,
                                    username: response.data.signUp.username,
                                    firstName: response.data.signUp.firstName,
                                    lastName: response.data.signUp.lastName,
                                    gender: response.data.signUp.gender,
                                    country: response.data.signUp.country,
                                    primaryEmail: response.data.signUp.primaryEmail,
                                    secondaryEmail: response.data.signUp.secondaryEmail,
                                    imageURL: response.data.signUp.imageURL,
                                    wsToken: response.data.signUp.wsToken,
                                });
                                navigation.navigate('Home');
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
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    title="Login"
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.subText}>Already have an account? Login</Text>
                </TouchableOpacity>
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
    },
    title: {
        fontSize: 24,
        marginTop: '10%',
        textAlign: 'center',
        color: '#007BFF',
        fontWeight: 'bold',
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
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignSelf: 'center',
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

export default SignUpScreen;
