import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PROJECTS_QUERY } from '../../graphql/Queries';
import { useQuery } from '@apollo/client';
import { getLogoImage } from '../../logoImages';
import { Card, Avatar, LoadingSpinner } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const ForumScreen = ({ navigation }) => {
    const { data, loading, error } = useQuery(PROJECTS_QUERY, {
        onError: (err) => {
            console.log('Forum projects query error:', err);
        }
    });

    const RenderItem = ({ item }) => {
        const hasCustomLogo = item.logo && item.logo !== 'logo-default.jpg';
        
        return (
            <Card 
                style={styles.projectCard}
                variant="outlined"
                onPress={() => navigation.navigate('Posts', { projectId: item.id, projectTitle: item.title })}
            >
                <View style={styles.projectContent}>
                    {hasCustomLogo ? (
                        <Avatar 
                            source={getLogoImage(item.logo)}
                            name={item.title}
                            size="lg"
                        />
                    ) : (
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="folder" size={32} color={colors.primary.main} />
                        </View>
                    )}
                    <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>{item.title}</Text>
                        <Text style={styles.projectDescription} numberOfLines={2}>{item.description}</Text>
                    </View>
                    <MaterialIcons name="arrow-forward-ios" size={20} color={colors.neutral[400]} />
                </View>
            </Card>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="forum" size={28} color={colors.primary.main} />
                <Text style={styles.headerTitle}>Forum</Text>
            </View>
            {data && (
                <FlatList
                    data={data.projects}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={RenderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
        backgroundColor: colors.background.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    listContent: {
        padding: spacing.lg,
    },
    projectCard: {
        marginBottom: spacing.md,
        borderWidth: 0,
    },
    projectContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    projectDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
})

export default ForumScreen;
