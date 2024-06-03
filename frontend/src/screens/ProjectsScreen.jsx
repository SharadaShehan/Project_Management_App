import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import ProjectsList from '../components/ProjectsList';
import { SafeAreaView } from 'react-native-safe-area-context';


const ProjectsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.innerContainer}>
        <ProjectsList navigation={navigation} />
        <TouchableOpacity style={styles.createProjectButton} onPress={() => navigation.navigate('CreateProject')}>
            <Text style={{ color: '#fff', fontSize: 17 }}>Create New Project</Text>
        </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    innerContainer: {
        height: '100%',
        backgroundColor: '#4CBB17',
        paddingTop: 0,
        marginTop: 0,
    },
    createProjectButton: {
        backgroundColor: '#007BFF',
        padding: 9,
        // margin: 10,
        marginTop: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    }
});

export default ProjectsScreen;

