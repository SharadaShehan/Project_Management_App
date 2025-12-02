import { Button, Text, Alert } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserGlobalState } from '../layout/UserState';
import { signOut } from 'aws-amplify/auth';

const LogOutBtn = ({ navigation }) => {
    const { userData, setUserData } = UserGlobalState();

    return (
        <TouchableOpacity onPress={
            async () => {
                try {
                    await signOut();
                    setUserData({
                        id: null,
                        firstName: null,
                        lastName: null,
                        username: null
                    });
                    navigation.navigate('Login');
                } catch (err) {
                    console.log('Sign out error:', err);
                    Alert.alert('Error', 'Failed to sign out');
                }
            }
        }>
        <MaterialIcons name="logout" size={30} color="#fff"
        style={{
            marginRight: 12, 
        }}/>
        </TouchableOpacity>
    );
    };

export default LogOutBtn;