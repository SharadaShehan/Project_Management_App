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
                {loading && <Text>Loading Posts...</Text>}
                {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
                {data && data.posts.length === 0 && 
                    <View style={{ alignItems: 'center', marginTop: 250 }}>
                        <Text>No Posts Found</Text>
                    </View>
                }
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
                <TouchableOpacity style={styles.createPostButton} onPress={() => navigation.navigate('CreatePost', { projectId: route.params.projectId, projectTitle: route.params.projectTitle })}>
                    <Text style={{ color: '#fff', fontSize: 17 }}>Create New Post</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#4CBB17'
    },
    innerContainer: {
        width: '90%',
        marginLeft: '5%',
        height: '95%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        // margin: 10,
    },
    postsContainer: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
    itemContainer: {
        paddingTop: 10,
        paddingBottom: 14,
        marginBottom: 5,
        backgroundColor: '#fff',
        borderRadius: 25,
        borderBottomWidth: 1,
        alignItems: 'center',
        marginHorizontal: '2%'
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postDescription: {
        fontSize: 14,
    },
    createPostButton: {
        backgroundColor: '#007BFF',
        padding: 9,
        margin: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    }
});

export default PostsScreen;
