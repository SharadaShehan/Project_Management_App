import React from 'react';
import { View, Text, Button, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CHANGE_PASSWORD_MUTATION } from '../queries/Mutations';
import { useMutation } from '@apollo/client';

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
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={{ alignItems: 'center', marginTop: '10%' }}>
                    <Text style={styles.titleText}>Change Password</Text>
                    <View style={styles.inputsContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            value={currentPassword}
                            secureTextEntry
                            onChangeText={(text) => setCurrentPassword(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            value={newPassword}
                            secureTextEntry
                            onChangeText={(text) => setNewPassword(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            secureTextEntry
                            onChangeText={(text) => setConfirmNewPassword(text)}
                        />
                    </View>
                </View>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity title='update' onPress={() => changePasswordhandler()} style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity title='cancel' onPress={() => navigation.navigate('Profile')} style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '55%',
        borderRadius: 40,
        backgroundColor: 'white',
        paddingHorizontal: '4%',
    },
    titleText: {
        fontSize: 28,
        marginTop: '5%',
        textAlign: 'center',
        // color: '#007BFF',
        fontWeight: 'bold',
    },
    inputsContainer: {
        marginTop: '10%',
        alignItems: 'center',
        width: '100%',
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
    buttonsContainer: {
        marginTop: '5%',
    },
    updateButton: {
        backgroundColor: '#007BFF',
        marginTop: '3%',
        borderRadius: 8,
        padding: 6,
        width: '90%',
        alignSelf: 'center',
    },
    updateButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    }
}


export default ChangePasswordScreen;
