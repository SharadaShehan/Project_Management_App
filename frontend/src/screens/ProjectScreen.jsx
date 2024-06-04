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
            <View style={styles.innerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                {projectLoading && <Text>project Loading ...</Text>}
                {projectError && ( projectError.status === 401 ? navigation.navigate('Login') : console.log(projectError.message))}

                {processLoading && <Text>process Loading ...</Text>}
                {processError && ( processError.status === 401 ? navigation.navigate('Login') : console.log(processError.message))}        

                {projectData && (
                    <View>
                        <Text style={styles.projectTitle}>{projectData.project.title}</Text>
                        <Text style={[styles.projectStatus, { color: projectData.project.status === 'Active' ? '#009900' : '#FF0000' }
                        ]}>{projectData.project.status}</Text>
                        <Text style={styles.projectDescription}>{projectData.project.description}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <FlatList
                                data={projectData.project.processes}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                ListFooterComponent={() => {
                                    if (userData.id === projectData.project.owner.id) {
                                        return (
                                            <TouchableOpacity style={[styles.item, { backgroundColor: '#007BFF', borderRadius: 8 }]} onPress={() => navigation.navigate('CreateProcess', { projectId: projectData.project.id })}>
                                                <Text style={styles.addProcessText}>+</Text>
                                            </TouchableOpacity>
                                        );
                                    } else return null;
                                }}
                            />
                        </View>
                    </View>
                )}

                {processData && (
                    <View style={{ marginHorizontal: 10 }}>
                        <Text style={styles.processTitle}>{processData.process.title}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 10, color: processData.process.status === 'Active' ? '#009900' : '#FF0000' }}
                        >{processData.process.status}</Text>
                        <Text>{processData.process.description}</Text>                 
                        {/* <Text>Priority: {processData.process.priority}</Text> */}
                        {processData.process.phases.length > 0 && (
                            <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phases</Text>
                        )}
                        {processData.process.phases.length === 0 && (
                            <Text style={{ fontWeight: 'bold', color: '#aaa', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>No Phases in current Process</Text>
                        )}
                        {processData.process.phases.slice().sort((a, b) => a.order - b.order).map((phase) => (
                            <TouchableOpacity key={phase.id+'0'} style={styles.phaseContainer}>
                                <Text key={phase.id+'1'} style={{ fontWeight: 'bold', fontSize: 17 }}>{phase.title}</Text>
                                <Text key={phase.id+'3'} style={{ fontSize: 12, marginBottom: 5, color: phase.status === 'Active' ? '#009900' : '#FF0000'
                                }}>{phase.status}</Text>
                                <Text key={phase.id+'2'}>{phase.description}</Text>
                                {phase.endDate && !phase.endTime && (<Text key={phase.id+'6'}>Deadline: {phase.endDate}</Text>)}
                                {phase.endTime && phase.endDate && (<Text key={phase.id+'9'}>Deadline: {(new Date((new Date(`${phase.endDate}T${phase.endTime}:00`)).getTime()-phase.timezoneOffset*60*1000)).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</Text>)}
                            </TouchableOpacity>
                        ))}
                        {projectData && processData && (userData.id === projectData.project.owner.id || processData.process.managers.map((manager) => manager.id).includes(userData.id)) && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => navigation.navigate('CreatePhase', { processId: selectedOption })}>
                                <Text style={styles.addProcessText}>Create New Phase</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {projectData && (
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Project Members</Text>
                        {projectData.project.members.map((member) => (
                            <View style={styles.memberContainer} key={member.username+'0'}>
                                <Text style={{ fontWeight: 'bold' }}
                                key={member.username+'1'}>{member.firstName} {member.lastName}</Text>
                                <Text style={{ fontSize: 12, color: '#434343' }}
                                key={member.username+'3'}>{member.username}</Text>
                            </View>
                        ))}
                        {userData.id === projectData.project.owner.id && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => navigation.navigate('AddMember', { projectId: projectData.project.id })}>
                                <Text style={styles.addProcessText}>Add/Remove Members</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                {projectData && processData && (userData.id === projectData.project.owner.id || processData.process.managers.map((manager) => manager.id).includes(userData.id)) && (
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#dd0000', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Delete Process') }}>
                        <Text style={styles.addProcessText}>Delete Process</Text>
                    </TouchableOpacity>
                )}
                {projectData && userData.id === projectData.project.owner.id && (
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#dd0000', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Delete Project') }}>
                        <Text style={styles.addProcessText}>Delete Project</Text>
                    </TouchableOpacity>
                )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        paddingBottom: 10,
        backgroundColor: '#4CBB17'
    },
    innerContainer: {
        width: '95%',
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#fff',
        paddingHorizontal: '4%',
        paddingBottom: 10,
    },
    projectTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 0,
        marginTop: 20,
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
        backgroundColor: '#eee',
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
    addProcessText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    processTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        // marginBottom: 12
    },
    phaseContainer: {
        backgroundColor: '#eee',
        padding: 10,
        margin: 5,
        marginHorizontal: 0,
        borderRadius: 5,
    },
    memberContainer: {
        backgroundColor: '#eee',
        padding: 10,
        margin: 5,
        borderRadius: 5,
    },
    lowerButton: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
        // width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
}

export default ProjectScreen;
