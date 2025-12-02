import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { PROJECTS_QUERY } from '../../graphql/Queries';
import { SEARCH_USERS_MUTATION } from '../../graphql/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { SearchBar } from "react-native-elements";
import { UserGlobalState } from '../../layout/UserState';
import { getLogoImage } from '../../logoImages';
import { MessagesGlobalState } from '../../layout/MessagesState';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const NewChatScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [projectsList, setProjectsList] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const { messagesData, setMessagesData } = MessagesGlobalState();

    const { data:projectsData, loading:projectsLoading, error:projectsError } = useQuery(PROJECTS_QUERY);
    const [searchUsers] = useMutation(SEARCH_USERS_MUTATION);

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
    };

    const renderUserItem = ({ item }) => {
        const userIndexInMessagesData = messagesData.findIndex((messageList) => messageList[0] && messageList[0].receiver && (messageList[0].receiver.id === item.id || messageList[0].sender.id === item.id));
        if (userIndexInMessagesData > -1) return null;
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => { navigation.navigate('PrivateChat', { user: item }) }}  style={styles.userItemContainer} key={item.id}>
                <View style={styles.itemContent}>
                    <Avatar
                        imageUrl={item.imageURL}
                        name={`${item.firstName} ${item.lastName}`}
                        size={32}
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                        <Text style={styles.username}>@{item.username}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderProjectItem = ({ item }) => {
        const projectIndexInMessagesData = messagesData.findIndex((messageList) => messageList[0] && messageList[0].project && messageList[0].project.id === item.id);
        if (projectIndexInMessagesData > -1) return null;
        return (
            <TouchableOpacity onPress={() => { navigation.navigate('ProjectChat', { project: item }) }} style={styles.userItemContainer} key={item.id}>
                <View style={styles.itemContent}>
                    <Avatar
                        imageUrl={getLogoImage(item.logo)}
                        name={item.title}
                        size={32}
                    />
                    <Text style={styles.projectName}>{item.title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Start New Chat</Text>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Users</Text>
                        <SearchBar
                            placeholder="Search for Users"
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
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        <FlatList
                            data={projectsData.projects}
                            renderItem={renderProjectItem}
                            keyExtractor={(item) => item.id}
                            initialNumToRender={5}
                            scrollEnabled={false}
                        />
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
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
        lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
    },
    searchContainer: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        paddingHorizontal: 0,
    },
    searchInputContainer: {
        backgroundColor: colors.neutral[50],
    },
    searchInput: {
        color: colors.text.primary,
        fontSize: typography.fontSize.sm,
    },
    userItemContainer: {
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    textContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
    username: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    projectName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        flex: 1,
        lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    },
});

export default NewChatScreen;
