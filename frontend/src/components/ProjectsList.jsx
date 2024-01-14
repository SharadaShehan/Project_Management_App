import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { PROJECTS_QUERY } from '../queries/Queries'; // Import your GraphQL queries
import { useQuery } from '@apollo/client';

const ProjectsList = ({ navigation }) => {

    const { data, loading, error } = useQuery(PROJECTS_QUERY);

    const RenderItem = ({ item }) => {
        console.log(item.defaultProcess);
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Project', { id: item.id, defaultProcess:item.defaultProcess })} 
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
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 0
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
    }
});

export default ProjectsList;
