import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATE_POST_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';

const CreatePostScreen = ({ navigation, route }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [createPost] = useMutation(CREATE_POST_MUTATION);
    const projectId = route.params.projectId;

    const createPostHandler = async () => {
        try {
            const response = await createPost({ variables: { projectId, title, content } });
            if (response.data.createPost.id) {
                Alert.alert('Success', 'Post created successfully');
                navigation.navigate('Posts', { projectId: projectId, projectTitle: route.params.projectTitle });
            } else {
                Alert.alert('Error', 'Post creation failed');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message.split('.').join('.\n');
            Alert.alert('Error', message);
        }
    };

    return (
        <SafeAreaView style={styles.createPostContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Create Post</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.textBox}
                        placeholder="Content"
                        value={content}
                        onChangeText={setContent}
                        multiline={true}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={createPostHandler}>
                    <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createPostContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '90%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        marginTop: '12%',
        textAlign: 'center',
        color: '#007BFF',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginTop: '5%',
        alignItems: 'center',
        marginBottom: '6%',
        width: '100%',
    },
    input: {
        width: '80%',
        height: 35,
        borderColor: '#007BFF',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        // borderRadius: 10,
        marginBottom: '5%',
        padding: 5,
    },
    textBox: {
        width: '80%',
        height: 150,
        borderColor: '#007BFF',
        borderWidth: 1,
        textAlignVertical: 'top',
        padding: 5,
    },
    userItemContainer: {
        padding: 10,
        backgroundColor: '#eee',
        marginVertical: 2,
        borderRadius: 15,
        width: '100%',
    },
    fullName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#434343',
        paddingLeft: 8,
    },
    username: {
        fontSize: 12,
        color: '#434343',
        paddingRight: 8,
    },
    rowButtonsContainer: {
        marginTop: '2%',
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '44%',
        alignSelf: 'center',
        marginHorizontal: '3%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default CreatePostScreen;
