import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ONE_PROJECT_QUERY, PROCESS_QUERY } from '../queries/Queries'; // Import your GraphQL queries
import { useQuery } from '@apollo/client';

const ProjectScreen = ({navigation, route}) => {

    const { data:projectData, loading:projectLoading, error:projectError } = useQuery(ONE_PROJECT_QUERY, {
        variables: { id: route.params.id },
    });

    const { data:processData, loading:processLoading, error:processError } = useQuery(PROCESS_QUERY, {
        variables: { id: route.params.defaultProcess.id },
    });

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            {projectLoading && <Text>project Loading ...</Text>}
            {projectError && ( projectError.status === 401 ? navigation.navigate('Login') : console.log(projectError.message))}

            {processLoading && <Text>process Loading ...</Text>}
            {processError && ( processError.status === 401 ? navigation.navigate('Login') : console.log(processError.message))}
            
            {processData && (
                <View>
                    <Text>process : </Text>
                    <Text>title : {processData.process.title}</Text>
                    <Text>description : {processData.process.description}</Text>
                </View>
            )}

            {projectData && (
                <View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>{projectData.project.title}</Text>
                    <Text>status : {projectData.project.status}</Text>
                    <Text>description : {projectData.project.description}</Text>
                    <Text>members : </Text>
                    {projectData.project.members.map((member) => (
                        <View style={{ margin: 10 }} key={member.username+'0'}>
                            <Text key={member.username+'1'}>{member.firstName} {member.lastName}</Text>
                            <Text key={member.username+'3'}>{member.username}</Text>
                        </View>
                    ))}
                </View>
            )}
        </SafeAreaView>
    );
}

export default ProjectScreen;
