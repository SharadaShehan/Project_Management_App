import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATE_POST_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const CreatePostScreen = ({ navigation, route }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [createPost] = useMutation(CREATE_POST_MUTATION);
    const projectId = route.params.projectId;

    const createPostHandler = async () => {
        try {
            const response = await createPost({ variables: { projectId, title, content } });
            if (response?.data?.createPost?.id) {
                Alert.alert('Success', 'Post created successfully');
                navigation.navigate('Posts', { projectId: projectId, projectTitle: route.params.projectTitle });
            } else {
                Alert.alert('Error', 'Post creation failed');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
            Alert.alert('Error', message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.formCard}>
                    <Text style={styles.title}>Create Post</Text>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            placeholder="Enter post title"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Content</Text>
                        <TextInput
                            placeholder="Write your post content here..."
                            value={content}
                            onChangeText={setContent}
                            multiline
                            numberOfLines={8}
                            style={styles.textArea}
                        />
                    </View>
                    
                    <View style={styles.buttonRow}>
                        <Button
                            variant="outline"
                            onPress={() => navigation.navigate('Posts', { projectId: projectId, projectTitle: route.params.projectTitle })}
                            style={styles.actionButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={createPostHandler}
                            style={styles.actionButton}
                        >
                            Create Post
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
        minHeight: 200,
        textAlignVertical: 'top',
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

export default CreatePostScreen;
