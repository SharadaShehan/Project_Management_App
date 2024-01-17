import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POSTS_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';

const PostsScreen = ({ navigation, route }) => {
    const { data, loading, error } = useQuery(POSTS_QUERY, {
        variables: { projectId: route.params.projectId }
    });

    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Post', { id: item.id })}
                style={styles.itemContainer} key={item.id}
            >
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postDescription}>{item.content}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.postsContainer}>
            {loading && <Text>Loading Posts...</Text>}
            {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
            {data && (
                <View>
                <FlatList
                    data={data.posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={RenderItem}
                />
                </View>
            )}
            </View>
            <TouchableOpacity style={styles.createPostButton} onPress={() => navigation.navigate('CreatePost', { projectId: route.params.projectId })}>
                <Text style={{ color: '#fff', fontSize: 17 }}>Create New Post</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 0,
        height: '75%',
    },
    postsContainer: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    itemContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    postTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postDescription: {
        fontSize: 15,
    },
    createPostButton: {
        backgroundColor: '#6BB64a',
        padding: 9,
        margin: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    }
});

export default PostsScreen;
