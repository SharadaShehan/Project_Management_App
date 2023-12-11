// DetailsScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import LogOutBtn from '../components/LogOutBtn';
import ProjectsList from '../components/ProjectsList';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
      <LogOutBtn navigation={navigation} />
      <ProjectsList navigation={navigation} />
    </View>
  );
};

export default HomeScreen;
