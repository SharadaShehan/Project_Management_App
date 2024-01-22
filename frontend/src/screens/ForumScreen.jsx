import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROJECTS_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';

const ForumScreen = ({ navigation }) => {
    const { data, loading, error } = useQuery(PROJECTS_QUERY);

    const RenderItem = ({ item }) => {
        console.log(item.defaultProcess);
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Posts', { projectId: item.id })}
                style={styles.itemContainer} key={item.id}
            >
                <View style={styles.ImageContainer}>
                    <Image source={require('../../images/projectIcon.jpg')} style={styles.imageItem} />
                </View>
                <View>
                    <Text style={styles.projectTitle}>{item.title}</Text>
                    <Text style={styles.projectDescription}>{item.description}</Text>
                    <Text style={styles.projectStatus}>Status: {item.status}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.projectsContainer}>
            <View style={styles.container}>
            {loading && <Text>Loading projects...</Text>}
            {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
            {data && (
                <View>
                <FlatList
                    data={data.projects}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={RenderItem}
                />
                </View>
            )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    projectsContainer: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    container: {
        padding: 0,
        height: '90%',
    },
    itemContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        flexDirection: 'row',
    },
    projectTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#434343'
    },
    projectDescription: {
        maxWidth: '90%',
        fontSize: 14,
        color: '#434343'
    },
    projectStatus: {
        fontSize: 15,
        color: '#434343'
    },
    memberItem: {
        margin: 10,
    },
    ImageContainer: {
        margin: 15
    },
    imageItem: {
        width: 60,
        height: 60,
        // margin: 10,
    },
    createForumButton: {
        backgroundColor: '#6BB64a',
        padding: 9,
        margin: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    }
});

export default ForumScreen;
