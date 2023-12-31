import React from 'react';
import { View, Text, Button } from 'react-native';
import ProjectsList from '../components/ProjectsList';
import { SafeAreaView } from 'react-native-safe-area-context';


const ProjectsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}> */}
        <Text>Projects Screen</Text>
        <ProjectsList navigation={navigation} />
        <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
        />
        {/* </View> */}
        </SafeAreaView>
    );
}

export default ProjectsScreen;
