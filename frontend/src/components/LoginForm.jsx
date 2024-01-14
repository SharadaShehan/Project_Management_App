import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SIGNIN_MUTATION } from '../queries/Mutations';
import { useMutation } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';

const LoginForm = ({navigation}) => {
  const { userData, setUserData } = UserGlobalState();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signIn, { data, loading, error }] = useMutation(SIGNIN_MUTATION);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <TouchableOpacity style={styles.button} onPress={
        async () => {
          try {
            const response = await signIn({
              variables: {
                username,
                password,
              }
            });
            // response.data.signIn.firstName
            if (response.data.signIn.firstName) {
              setUserData({
                id: response.data.signIn.id,
                firstName: response.data.signIn.firstName,
                lastName: response.data.signIn.lastName,
                username: response.data.signIn.username,
                wsToken: response.data.signIn.wsToken,
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
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

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
    width: 250,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    padding: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default LoginForm;
