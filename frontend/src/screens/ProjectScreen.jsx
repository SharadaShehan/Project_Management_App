import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ONE_PROJECT_QUERY, PROCESS_QUERY } from '../queries/Queries'; // Import your GraphQL queries
import { useQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';

const ProjectScreen = ({navigation, route}) => {

    const { userData } = UserGlobalState();

    const { data:projectData, loading:projectLoading, error:projectError } = useQuery(ONE_PROJECT_QUERY, {
        variables: { id: route.params.id },
    });

    const [selectedOption, setSelectedOption] = useState(route.params.defaultProcess.id);

    const { data:processData, loading:processLoading, error:processError } = useQuery(PROCESS_QUERY, {
        variables: { id: route.params.defaultProcess.id },
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
          style={[
            styles.item,
            selectedOption === item.id ? styles.selectedItem : null,
          ]}
          onPress={() => {
            navigation.navigate('Project', { id: projectData.project.id, defaultProcess: item });
            setSelectedOption(item.id);
          }
        }
        >
          <Text style={[styles.itemText, selectedOption === item.id ? styles.selectedItemText : null]}>{item.title}</Text>
        </TouchableOpacity>
      );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
            {projectLoading && <Text>project Loading ...</Text>}
            {projectError && ( projectError.status === 401 ? navigation.navigate('Login') : console.log(projectError.message))}

            {processLoading && <Text>process Loading ...</Text>}
            {processError && ( processError.status === 401 ? navigation.navigate('Login') : console.log(processError.message))}        

            {projectData && (
                <View>
                    <Text style={styles.projectTitle}>{projectData.project.title}</Text>
                    <Text style={styles.projectStatus}>{projectData.project.status}</Text>
                    <Text style={styles.projectDescription}>{projectData.project.description}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <FlatList
                            data={projectData.project.processes}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                </View>
            )}

            {processData && (
                <View>
                    <Text style={styles.processTitle}>{processData.process.title}</Text>
                    <Text>description : {processData.process.description}</Text>
                    <Text>status: {processData.process.status}</Text>
                    <Text>Priority: {processData.process.priority}</Text>
                    <Text>Phases: </Text>
                    {processData.process.phases.map((phase) => (
                        <TouchableOpacity key={phase.id+'0'} style={styles.phaseContainer}>
                            <Text key={phase.id+'1'}>title: {phase.title}</Text>
                            <Text key={phase.id+'2'}>description: {phase.description}</Text>
                            <Text key={phase.id+'4'}>order: {phase.order}</Text>
                            <Text key={phase.id+'3'}>status: {phase.status}</Text>
                            <Text key={phase.id+'6'}>endDate: {phase.endDate}</Text>
                            <Text key={phase.id+'7'}>endTime: {phase.endTime}</Text>
                            <Text key={phase.id+'8'}>timezoneOffset: {phase.timezoneOffset}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {projectData && (
                <View>
                    <Text>members : </Text>
                    {projectData.project.members.map((member) => (
                        <View style={{ margin: 10 }} key={member.username+'0'}>
                            <Text key={member.username+'1'}>{member.firstName} {member.lastName}</Text>
                            <Text key={member.username+'3'}>{member.username}</Text>
                        </View>
                    ))}
                </View>
            )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff'
    },
    projectTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 0,
        color: '#434343',
        textAlign: 'center'
    },
    projectStatus: {
        fontSize: 14,
        marginBottom: 5,
        color: '#434343',
        textAlign: 'center'
    },
    projectDescription: {
        fontSize: 16,
        marginBottom: 10,
        color: '#434343',
        textAlign: 'center'
    },
    item: {
        backgroundColor: '#d8d8d8',
        padding: 10,
        margin: 5,
        borderRadius: 5,
      },
      selectedItem: {
        backgroundColor: '#6BB64a',
      },
      itemText: {
        color: '#000',
      },
        selectedItemText: {
            color: '#fff',
        },
    processTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12
    },
    phaseContainer: {
        backgroundColor: '#eee',
        padding: 10,
        margin: 5,
        borderRadius: 5,
    }
}

export default ProjectScreen;
