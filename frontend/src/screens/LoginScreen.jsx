import React from 'react';
import { View, Text, Button } from 'react-native';
import LoginForm from '../components/LoginForm';
import SignUp from '../components/SignUp';
import { useState } from 'react';

const LoginScreen = ({ navigation }) => {
  const [ loginPage, setLoginPage ] = useState(true);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 5 }}> 
      {loginPage ? <LoginForm navigation={navigation} /> : <SignUp navigation={navigation} />}
      <Button
        title={loginPage ? 'Sign Up' : 'Login'}
        onPress={() => setLoginPage(!loginPage)}
      />
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

export default LoginScreen;
