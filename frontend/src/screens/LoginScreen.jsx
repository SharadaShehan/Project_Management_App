import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { UserGlobalState } from '../layout/UserState';
import { SIGNIN_MUTATION } from '../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { Button } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const { userData, setUserData } = UserGlobalState();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signIn, { data, loading, error }] = useMutation(SIGNIN_MUTATION);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
      <Text style={styles.title}>LOGIN</Text>
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
      </View>
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
                username: response.data.signIn.username,
                firstName: response.data.signIn.firstName,
                lastName: response.data.signIn.lastName,
                gender: response.data.signIn.gender,
                country: response.data.signIn.country,
                primaryEmail: response.data.signIn.primaryEmail,
                secondaryEmail: response.data.signIn.secondaryEmail,
                imageURL: response.data.signIn.imageURL,
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
      <TouchableOpacity
        title="Sign Up"
        onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.subText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CBB17',
  },
  innerContainer: {
    width: '90%',
    height: '60%',
    borderRadius: 40,
    backgroundColor: 'white',
    paddingHorizontal: '4%',
  },
  title: {
    fontSize: 28,
    marginTop: '25%',
    textAlign: 'center',
    color: '#007BFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: '10%',
    alignItems: 'center',
    marginBottom: '8%',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    // borderRadius: 10,
    marginBottom: '5%',
    padding: 10,
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
  subText: {
    marginTop: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
});

export default LoginScreen;
