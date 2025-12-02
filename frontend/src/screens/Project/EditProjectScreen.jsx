import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UPDATE_PROJECT_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';
import { Button, TextInput as ThemedTextInput, Card } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const EditProjectScreen = ({ navigation, route }) => {
    const projectId = route.params?.project?.id;
    
    if (!projectId) {
        Alert.alert('Error', 'Invalid project');
        navigation.goBack();
        return null;
    }
    const [title, setTitle] = useState(route.params.project.title);
    const [description, setDescription] = useState(route.params.project.description);
    const [status, setStatus] = useState(route.params.project.status);
    const statusArray = ['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD'];
    const [defaultProcess, setDefaultProcess] = useState(route.params.project.defaultProcess?.id || '');
    const processes = route.params.project.processes;
    const { userData, setUserData } = UserGlobalState();
    const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION);

    const updateProjectHandler = async () => {
        try {
            // Validate required fields
            if (!title || title.trim().length === 0) {
                Alert.alert('Error', 'Title is required');
                return;
            }
            if (title.trim().length > 100) {
                Alert.alert('Error', 'Title must be 1-100 characters');
                return;
            }
            if (description && description.trim().length > 500) {
                Alert.alert('Error', 'Description must be 1-500 characters');
                return;
            }
            
            let variables = { id: projectId };
            
            const trimmedTitle = title.trim();
            const trimmedDescription = description ? description.trim() : '';
            
            // Only include changed fields
            if (trimmedTitle !== route.params.project.title) {
                variables.title = trimmedTitle;
            }
            if (trimmedDescription !== route.params.project.description) {
                variables.description = trimmedDescription;
            }
            if (status !== route.params.project.status) {
                variables.status = status;
            }
            if (defaultProcess !== (route.params.project.defaultProcess?.id || '')) {
                variables.defaultProcess = defaultProcess || null;
            }
            
            console.log('Update variables:', JSON.stringify(variables));
            const response = await updateProject({ variables });
            if (response?.data?.updateProject?.id) {
                Alert.alert('Project updated successfully');
                navigation.navigate('Project', { 
                    id: response.data.updateProject.id, 
                    defaultProcess: response.data.updateProject.defaultProcess || null 
                });
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
            Alert.alert('Error', message);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Update Project</Text>
                    
                    <ThemedTextInput
                        placeholder="Project Title"
                        value={title}
                        onChangeText={setTitle}
                        icon={<MaterialIcons name="title" size={20} color={colors.neutral[400]} />}
                        style={styles.input}
                    />
                    
                    <ThemedTextInput
                        placeholder="Project Description"
                        value={description}
                        onChangeText={setDescription}
                        icon={<MaterialIcons name="description" size={20} color={colors.neutral[400]} />}
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                    />
                    
                    <View style={styles.selectSection}>
                        <Text style={styles.selectLabel}>Status</Text>
                        <SelectList
                            data={statusArray}
                            title="Status"
                            value={status}
                            setSelected={setStatus}
                            boxStyles={styles.selectBox}
                        /> 
                    </View>
                    
                    {processes && processes.length > 0 && (
                        <View style={styles.selectSection}>
                            <Text style={styles.selectLabel}>Default Process</Text>
                            <SelectList
                                data={processes.map(process => ({ key: process.id, value: process.name || process.title }))}
                                title="Default Process"
                                save="key"
                                defaultOption={processes.find(process => process.id === defaultProcess) ? { 
                                    key: defaultProcess, 
                                    value: processes.find(process => process.id === defaultProcess).name || processes.find(process => process.id === defaultProcess).title 
                                } : undefined}
                                setSelected={setDefaultProcess}
                                boxStyles={styles.selectBox}
                            />
                        </View>
                    )}
                </Card>
                
                <View style={styles.buttonContainer}>
                    <Button
                        variant="outline"
                        size="lg"
                        onPress={() => navigation.goBack()}
                        style={styles.buttonHalf}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onPress={updateProjectHandler}
                        icon={<MaterialIcons name="save" size={20} color={colors.text.inverse} />}
                        style={styles.buttonHalf}
                    >
                        Update
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    formCard: {
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    input: {
        marginBottom: spacing.lg,
    },
    textArea: {
        marginBottom: spacing.lg,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    selectSection: {
        marginBottom: spacing.lg,
    },
    selectLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    selectBox: {
        borderColor: colors.border.default,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background.white,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    buttonHalf: {
        flex: 1,
    },
});

export default EditProjectScreen;
