import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import ProjectsList from '../components/ProjectsList';
import { SafeAreaView } from 'react-native-safe-area-context';


const ProjectsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.projectsContainer}>
        <ProjectsList navigation={navigation} />
        <TouchableOpacity style={styles.createProjectButton} onPress={() => navigation.navigate('CreateProject')}>
            <Text style={{ color: '#fff', fontSize: 17 }}>Create New Project</Text>
        </TouchableOpacity>
        <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.createProjectButton}
        />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    projectsContainer: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: 10,
        paddingRight: 10,
    },
    createProjectButton: {
        backgroundColor: '#6BB64a',
        padding: 9,
        margin: 10,
        marginTop: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    }
});

export default ProjectsScreen;

