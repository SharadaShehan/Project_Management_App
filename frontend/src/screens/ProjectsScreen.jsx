import React from 'react';
import { View, Text, Button } from 'react-native';
import ProjectsList from '../components/ProjectsList';


const ProjectsScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>Projects Screen</Text>
        <ProjectsList navigation={navigation} />
        <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
        />
        </View>
    );
}

export default ProjectsScreen;
