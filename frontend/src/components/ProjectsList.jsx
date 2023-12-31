import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { PROJECTS_QUERY } from '../queries/Queries'; // Import your GraphQL queries
import { useQuery } from '@apollo/client';

const ProjectsList = ({ navigation }) => {

    const { data, loading, error } = useQuery(PROJECTS_QUERY);

    const RenderItem = ({ item }) => {
        console.log(item.defaultProcess);
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Project', { id: item.id, defaultProcess:item.defaultProcess })}>
                <Text style={styles.projectTitle}>{item.title}</Text>
                <Text>{item.status}</Text>
                {/* {item.members.map((member) => (
                    <View style={styles.memberItem} key={member.username+'0'}>
                        <Text key={member.username+'1'}>{member.firstName}</Text>
                        <Text key={member.username+'2'}>{member.lastName}</Text>
                        <Text key={member.username+'3'}>{member.primaryEmail}</Text>
                    </View>
                ))} */}
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
        {loading && <Text>Loading projects...</Text>}
        {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
        {data && (
            <View>
            <Text style={styles.title}>Projects</Text>
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
        padding: 5,
        // width: 200
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    projectTitle: {
        fontSize: 20,
        marginTop: 10,
    },
    memberItem: {
        margin: 10,
    },
});

export default ProjectsList;
