import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import ProjectsList from '../components/ProjectsList';
import { SafeAreaView } from 'react-native-safe-area-context';


const ProjectsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.projectsContainer}>
        <ProjectsList navigation={navigation} />
        <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
        />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    projectsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    }
});

export default ProjectsScreen;

