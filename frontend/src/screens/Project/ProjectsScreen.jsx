import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ProjectsList from '../../components/ProjectsList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';


const ProjectsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.innerContainer}>
        <ProjectsList navigation={navigation} />
        <TouchableOpacity style={styles.addNewButton} onPress={() => navigation.navigate('CreateProject')}>
            <MaterialIcons name="add" size={28} color={colors.text.inverse} />
        </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    innerContainer: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    addNewButton: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.primary.main,
        borderRadius: borderRadius.full,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
    }
});

export default ProjectsScreen;

