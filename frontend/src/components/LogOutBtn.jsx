import { Button, Text } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SIGNOUT_MUTATION } from '../graphql/Mutations';
import { useMutation } from '@apollo/client';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { UserGlobalState } from '../layout/UserState';

const LogOutBtn = ({ navigation }) => {
    const { userData, setUserData } = UserGlobalState();
    const [signOut, { data, loading, error }] = useMutation(SIGNOUT_MUTATION);

    return (
        <TouchableOpacity onPress={
            async () => {
                try {
                    const response = await signOut();
                    if (response.data.signOut) {
                        setUserData({
                            id: null,
                            firstName: null,
                            lastName: null,
                            username: null
                        });
                        navigation.navigate('Login');
                    } else {
                        alert('failed to logout');
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }>
        <MatIcon name="logout" size={30} color="#fff"
        style={{
            marginRight: 12, 
        }}/>
        </TouchableOpacity>
    );
    };

export default LogOutBtn;