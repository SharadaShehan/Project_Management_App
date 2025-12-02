import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATE_PROCESS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { UserGlobalState } from '../../layout/UserState';
import { SelectList } from 'react-native-dropdown-select-list';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const CreateProcessScreen = ({ navigation, route }) => {
    const projectId = route.params?.project?.id;
    const projectMembers = route.params?.project?.members;
    
    if (!projectId) {
        Alert.alert('Error', 'Invalid project');
        navigation.goBack();
        return null;
    }
    
    const priorityLevels = ['Low', 'Normal', 'High'];
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [managers, setManagers] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const [createProcess] = useMutation(CREATE_PROCESS_MUTATION);
    
    const createProcessHandler = async () => {
        try {
            let variables = {};
            if (projectId) variables.projectId = projectId;
            if (title) variables.name = title;
            if (description) variables.description = description;
            console.log('Create process variables:', JSON.stringify(variables));
            const response = await createProcess({ variables: variables });
            console.log('Create process response:', JSON.stringify(response));
            if (response?.data?.createProcess?.id) {
                Alert.alert('Process Created');
                navigation.navigate('Project', { id: projectId, defaultProcess: response.data.createProcess });
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

    const RenderItem = ({ item, cross }) => {
        return (
            <View style={styles.memberItemContent}>
                <Avatar
                    imageUrl={item.imageURL}
                    name={`${item.firstName} ${item.lastName}`}
                    size={32}
                />
                <View style={styles.memberTextContainer}>
                    <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.memberUsername}>@{item.username}</Text>
                </View>
                {cross && <MaterialIcons name="close" size={20} color={colors.status.error} style={styles.removeIcon} />}
            </View>
        );
    };

    const renderManagerItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                setManagers(managers.filter(manager => manager.id !== item.id));
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        if (managers.some(manager => manager.id === item.id)) return null;
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => {
                if (!managers.some(manager => manager.id === item.id)) {
                    setManagers([...managers, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Create Process</Text>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Process Name</Text>
                        <TextInput
                            placeholder="Enter process name"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            placeholder="Enter process description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            style={styles.textArea}
                        />
                    </View>
                    
                    <View style={styles.selectSection}>
                        <Text style={styles.label}>Priority Level</Text>
                        <SelectList
                            data={priorityLevels}
                            setSelected={setPriority}
                            defaultOption={priorityLevels[1]}
                            boxStyles={styles.selectBox}
                            dropdownStyles={styles.dropdown}
                        />
                    </View>
                    
                    <View style={styles.managersSection}>
                        <Text style={styles.sectionTitle}>Selected Managers</Text>
                        {managers.length === 0 ? (
                            <Text style={styles.emptyText}>No managers selected</Text>
                        ) : (
                            <FlatList
                                data={managers}
                                renderItem={renderManagerItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                    
                    <View style={styles.membersSection}>
                        <Text style={styles.sectionTitle}>Add Managers from Project Members</Text>
                        <FlatList
                            data={projectMembers}
                            renderItem={renderMemberItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    </View>
                    
                    <View style={styles.buttonRow}>
                        <Button
                            variant="outline"
                            onPress={() => navigation.goBack()}
                            style={styles.actionButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={createProcessHandler}
                            style={styles.actionButton}
                        >
                            Create Process
                        </Button>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    scrollContent: {
        padding: spacing.md,
    },
    formCard: {
        padding: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: typography.lineHeight.tight * typography.fontSize['2xl'],
    },
    formSection: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    selectSection: {
        marginBottom: spacing.lg,
    },
    selectBox: {
        borderColor: colors.border.light,
        borderRadius: borderRadius.md,
    },
    dropdown: {
        borderColor: colors.border.light,
    },
    managersSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    membersSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
        lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: spacing.md,
    },
    userItemContainer: {
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
    },
    memberItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    memberTextContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    memberUsername: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    removeIcon: {
        marginLeft: 'auto',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    actionButton: {
        flex: 1,
    },
});

export default CreateProcessScreen;