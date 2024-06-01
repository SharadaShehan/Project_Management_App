import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SIGNUP_MUTATION, GET_PRESIGNED_URL_MUTATION } from '../queries/Mutations';
import { useMutation, useQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';
import { RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const SignUp = ({navigation}) => {
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
    const [signUp, { data, loading, error }] = useMutation(SIGNUP_MUTATION);
    const [getPresignedURL, { data: presignedURLData, loading: presignedURLLoading, error: presignedURLError }] = useMutation(GET_PRESIGNED_URL_MUTATION);

    const handleUploadFile = async () => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
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
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
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
            <View style={styles.radioGroup}>
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
            <TouchableOpacity style={styles.button} onPress={handleUploadFile}>
                <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={
                async () => {
                    try {
                        const response = await signUp({
                            variables: {
                                username,
                                password,
                                firstName,
                                lastName,
                                gender,
                                country,
                                primaryEmail,
                                secondaryEmail,
                                imageURL,
                            }
                        });
                        if (response.data.signUp.firstName) {
                            setUserData({
                                id: response.data.signUp.id,
                                firstName: response.data.signUp.firstName,
                                lastName: response.data.signUp.lastName,
                                username: response.data.signUp.username,
                                wsToken: response.data.signUp.wsToken,
                                imageURL: response.data.signUp.imageURL,
                            });
                            navigation.navigate('Home');
                        } else {
                            alert('Invalid username or password');
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            }>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        width: '80%',
        height: 40,
        margin: 6,
        borderWidth: 1,
        padding: 10,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#007BFF',
        padding: 10,
        margin: 12,
        width: '80%',
    },
    buttonText: {
        color: 'white',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioLabel: {
        fontSize: 16,
        marginLeft: 5,
    },
});

export default SignUp;