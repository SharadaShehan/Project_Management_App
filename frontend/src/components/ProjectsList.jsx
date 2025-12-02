import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PROJECTS_QUERY } from '../graphql/Queries';
import { useQuery } from '@apollo/client';
import { getLogoImage } from '../logoImages';
import { Card, Avatar, LoadingSpinner } from './index';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

const ProjectsList = ({ navigation }) => {

    const { data, loading, error } = useQuery(PROJECTS_QUERY, {
        onError: (err) => {
            console.log('Projects query error:', err);
        }
    });

    const RenderItem = ({ item }) => {
        const hasCustomLogo = item.logo && item.logo !== 'logo-default.jpg';
        
        return (
            <Card
                style={styles.projectCard}
                onPress={() => navigation.navigate('Project', { id: item.id, defaultProcess: item.defaultProcess })}
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
                        <Text style={styles.projectDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                    <MaterialIcons name="arrow-forward-ios" size={20} color={colors.neutral[400]} />
                </View>
            </Card>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <LoadingSpinner />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color={colors.status.error} />
                    <Text style={styles.errorText}>Failed to load projects</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {data && (
                <FlatList
                    data={data.projects}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={RenderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
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
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    errorText: {
        fontSize: typography.fontSize.base,
        color: colors.status.error,
        fontWeight: typography.fontWeight.medium,
    },
});

export default ProjectsList;
