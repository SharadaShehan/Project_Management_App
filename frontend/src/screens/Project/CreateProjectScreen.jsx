import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CREATE_PROJECT_MUTATION, SEARCH_USERS_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { SearchBar } from "react-native-elements"; 
import { UserGlobalState } from '../../layout/UserState';
import { logoImagesArray } from '../../logoImages';
import { Button, TextInput as ThemedTextInput, Card, Avatar } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const CreateProjectScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [members, setMembers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [logo, setLogo] = useState('');
    const { userData, setUserData } = UserGlobalState();
    const [createProject] = useMutation(CREATE_PROJECT_MUTATION);
    const [searchUsers] = useMutation(SEARCH_USERS_MUTATION);

    const createProjectHandler = async () => {
        // Validation
        if (!title || title.trim().length === 0) {
            Alert.alert('Validation Error', 'Please enter a project title');
            return;
        }
        
        if (!description || description.trim().length === 0) {
            Alert.alert('Validation Error', 'Please enter a project description');
            return;
        }

        try {
            const membersIds = members.map(member => member.id);
            const variables = { 
                title: title.trim(), 
                description: description.trim(), 
                members: membersIds, 
                logo: logo ? logo.file : null 
            };
            
            console.log('Creating project with variables:', variables);
            const response = await createProject({ variables });
            console.log('Create project response:', response);
            
            if (response.data && response.data.createProject && response.data.createProject.id) {
                Alert.alert('Success', 'Project created successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Project', { 
                            id: response.data.createProject.id, 
                            defaultProcess: response.data.createProject.defaultProcess || null 
                        })
                    }
                ]);
            } else {
                Alert.alert('Error', 'Failed to create project. Please try again.');
            }
        } catch (err) {
            console.error('Create project error:', err);
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
            Alert.alert('Error', message);
        }
    }

    const searchTextChangeHandler = async (text) => {
        setSearchText(text);
        if (text.length > 0) {
            setSearchLoading(true);
            try {
                const response = await searchUsers({ variables: { searchText: text } });
                setSearchList(response.data.searchUsers);
            } catch (err) {
                const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
                Alert.alert('Error', message);
            }
            setSearchLoading(false);
        } else {
            setSearchList([]);
        }
    }

    const RenderItem = ({ item, cross }) => {
        return (
            <View style={styles.memberItemContent}>
                <Avatar 
                    source={item.imageURL ? { uri: item.imageURL } : require('../../../images/profile.webp')}
                    name={`${item.firstName} ${item.lastName}`}
                    size="sm"
                />
                <View style={styles.memberTextContainer}>
                    <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                </View>
                {cross && (
                    <MaterialIcons name="close" size={20} color={colors.status.error} style={styles.removeIcon} />
                )}
            </View>
        );
    };

    const renderUserItem = ({ item }) => {
        if (members.some(member => member.id === item.id)) return null;
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => {
                if (!members.some(member => member.id === item.id)) {
                    setMembers([...members, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                setMembers(members.filter(member => member.id !== item.id));
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.createProjectContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Create Project</Text>
                    
                    <ThemedTextInput
                        label="Project Title"
                        placeholder="Enter project title"
                        value={title}
                        onChangeText={setTitle}
                        leftIcon={<MaterialIcons name="work" size={20} color={colors.neutral[500]} />}
                    />
                    
                    <ThemedTextInput
                        label="Description"
                        placeholder="Enter project description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        leftIcon={<MaterialIcons name="description" size={20} color={colors.neutral[500]} />}
                    />
                    <View style={styles.logoSection}>
                        <Text style={styles.sectionLabel}>Project Logo</Text>
                        <View style={styles.logoContainer}>
                            {!logo ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logoScroll}>
                                    {logoImagesArray.map((obj, index) => (
                                        <TouchableOpacity key={index} onPress={() => setLogo(obj)} style={styles.logoOption}>
                                            <Image source={obj.image} style={styles.logoImage} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={styles.selectedLogoContainer}>
                                    <Image source={logo.image} style={styles.selectedLogo} />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onPress={() => setLogo('')}
                                        style={styles.removeLogoBtn}
                                    >
                                        Remove
                                    </Button>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.membersSection}>
                        <Text style={styles.sectionLabel}>Team Members</Text>
                        <FlatList
                            data={members}
                            renderItem={renderMemberItem}
                            keyExtractor={(item) => item.id}
                            initialNumToRender={5}
                            scrollEnabled={false}
                        />
                        <SearchBar
                            placeholder="Search for users to add"
                            onChangeText={searchTextChangeHandler}
                            value={searchText}
                            onClear={() => setSearchList([])}
                            containerStyle={styles.searchContainer}
                            inputContainerStyle={styles.searchInputContainer}
                            inputStyle={styles.searchInput}
                            leftIconContainerStyle={{ paddingLeft: 5 }}
                            lightTheme={true}
                            round={true}
                            showCancel={searchText.length > 0}
                            showLoading={searchLoading}
                        />
                        <FlatList
                            data={searchList}
                            renderItem={renderUserItem}
                            keyExtractor={(item) => item.id}
                            initialNumToRender={5}
                            scrollEnabled={false}
                        />
                    </View>
                    
                    <View style={styles.buttonContainer}>
                        <Button
                            variant="outline"
                            size="lg"
                            onPress={() => navigation.goBack()}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            onPress={createProjectHandler}
                            icon={<MaterialIcons name="add" size={20} color={colors.text.inverse} />}
                            style={styles.createButton}
                        >
                            Create Project
                        </Button>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createProjectContainer: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.lg,
    },
    formCard: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        borderWidth: 0,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    logoSection: {
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    logoContainer: {
        marginBottom: spacing.sm,
    },
    logoScroll: {
        flexGrow: 0,
    },
    logoOption: {
        marginRight: spacing.md,
        borderWidth: 2,
        borderColor: colors.border.default,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
    },
    logoImage: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.md,
    },
    selectedLogoContainer: {
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
    },
    selectedLogo: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    removeLogoBtn: {
        paddingHorizontal: spacing.lg,
    },
    membersSection: {
        marginBottom: spacing.lg,
    },
    searchContainer: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingHorizontal: 0,
        paddingVertical: spacing.sm,
        marginTop: spacing.sm,
    },
    searchInputContainer: {
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
    },
    searchInput: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    userItemContainer: {
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        marginVertical: spacing.xs,
        borderRadius: borderRadius.lg,
        width: '100%',
    },
    memberItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    memberTextContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    username: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    removeIcon: {
        marginLeft: 'auto',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    cancelButton: {
        flex: 1,
    },
    createButton: {
        flex: 2,
    },
});

export default CreateProjectScreen;