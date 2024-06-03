import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { PROJECTS_QUERY } from '../queries/Queries'; // Import your GraphQL queries
import { useQuery } from '@apollo/client';
import { getLogoImage } from '../logoImages';

const ProjectsList = ({ navigation }) => {

    const { data, loading, error } = useQuery(PROJECTS_QUERY);

    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Project', { id: item.id, defaultProcess:item.defaultProcess })} 
                style={styles.itemContainer} key={item.id}
            >
                <View style={styles.ImageContainer}>
                    <Image source={getLogoImage(item.logo)} style={styles.imageItem} />
                </View>
                <View>
                    <Text style={styles.projectTitle}>{item.title}</Text>
                    <Text style={styles.projectDescription}>{item.description}</Text>
                    {/* <Text style={styles.projectStatus}>Status: {item.status}</Text> */}
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
        {loading && <Text>Loading projects...</Text>}
        {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
        {data && (
            <View style={{ flex: 1, width: '100%' }}>
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
        paddingHorizontal: 8,
        height: '90%',
        paddingTop: 0,
        marginTop: 0,
    },
    itemContainer: {
        paddingTop: 8,
        paddingBottom: 12,
        marginBottom: 5,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 25,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#434343'
    },
    projectDescription: {
        maxWidth: '87%',
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
        margin: 13,
        marginTop: 15,
    },
    imageItem: {
        width: 60,
        height: 60,
        borderRadius: 50,
        // margin: 10,
    }
});

export default ProjectsList;
