import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POSTS_QUERY } from '../../graphql/Queries';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const PostsScreen = ({ navigation, route }) => {
    const { data, loading, error } = useQuery(POSTS_QUERY, {
        variables: { projectId: route.params.projectId }, fetchPolicy: 'network-only'
    });

    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Post', { id: item.id, projectTitle: route.params.projectTitle })}
                style={styles.itemContainer} key={item.id}
            >
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postDescription}>{item.content}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.postsContainer}>
                {loading && <Text style={styles.loadingText}>Loading Posts...</Text>}
                {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
                {data && data.posts.length === 0 && 
                    <Card style={styles.emptyCard}>
                        <MaterialIcons name="forum" size={48} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>No Posts Found</Text>
                    </Card>
                }
                {data && (
                    <FlatList
                        data={data.posts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={RenderItem}
                        contentContainerStyle={styles.listContent}
                    />
                )}
                </View>
                <Button
                    onPress={() => navigation.navigate('CreatePost', { projectId: route.params.projectId, projectTitle: route.params.projectTitle })}
                    style={styles.createButton}
                >
                    <View style={styles.createButtonContent}>
                        <MaterialIcons name="add" size={20} color={colors.neutral.white} />
                        <Text style={styles.createButtonText}>Create New Post</Text>
                    </View>
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    innerContainer: {
        flex: 1,
        margin: spacing.md,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    postsContainer: {
        flex: 1,
    },
    listContent: {
        gap: spacing.sm,
    },
    itemContainer: {
        padding: spacing.md,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    postTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        lineHeight: typography.lineHeight.tight * typography.fontSize.lg,
    },
    postDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    loadingText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
        marginTop: spacing['4xl'],
        gap: spacing.md,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.tertiary,
    },
    createButton: {
        margin: spacing.md,
    },
    createButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    createButtonText: {
        color: colors.neutral.white,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
    },
});

export default PostsScreen;
