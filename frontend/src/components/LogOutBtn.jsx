import { Button, Text } from 'react-native';
import React from 'react';
import { SIGNOUT_MUTATION } from '../queries/Mutations';
import { useMutation } from '@apollo/client';

const LogOutBtn = ({ navigation }) => {
    const [signOut, { data, loading, error }] = useMutation(SIGNOUT_MUTATION);

    return (
        <Button
        title="Logout"
        onPress={
            async () => {
                try {
                    const response = await signOut();
                    if (response.data.signOut) {
                        navigation.navigate('Login');
                    } else {
                        alert('failed to logout');
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
        />
    );
    };

export default LogOutBtn;