import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateProjectScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.createProjectContainer}>
            <Text>Create Project Screen</Text>
            <Button
                title="Go to Home"
                onPress={() => navigation.navigate('Home')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createProjectContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
});

export default CreateProjectScreen;