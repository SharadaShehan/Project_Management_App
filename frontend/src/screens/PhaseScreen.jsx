import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PHASE_QUERY } from '../queries/Queries';
import { DELETE_PHASE_MUTATION } from '../queries/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';

const PhaseScreen = ({navigation, route}) => {
    const phaseId = route.params.id;
    const process = route.params.process;
    const project = route.params.project;
    const { userData } = UserGlobalState();
    const { data:phaseData, loading:phaseLoading, error:phaseError } = useQuery(PHASE_QUERY, { variables: { id: phaseId }, fetchPolicy: 'network-only' });
    const [deletePhase] = useMutation(DELETE_PHASE_MUTATION);

    const RenderItem = ({ item }) => (
        <TouchableOpacity style={styles.taskContainer} disabled={phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id) ? false : true}
            onPress={() => navigation.navigate('Task', { task: item, phase: phaseData.phase })}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, alignSelf:'center' }}>{item.title}</Text>
            <Text style={{ fontSize: 12, alignSelf:'center', color: item.status === 'Active' ? '#009900' : '#FF0000' }}>{item.status}</Text>
            {item.description && <Text style={{ fontSize: 14, alignSelf:'center' }}>{item.description}</Text>}
            {item.taskAssignees.length === 0 && <Text style={{ fontSize: 14, alignSelf:'center' }}>Task Unassigned</Text>}
            {item.taskAssignees.length > 0 && (
                <View>
                    <Text style={{ fontWeight: 'bold', marginTop: 8, alignSelf:'center' }}>Task Assigned To</Text>
                    {item.taskAssignees.map((assignee) => (
                        <View style={styles.miniMemberContainer} key={assignee.username+'0'}>
                            <Text style={{ fontWeight: 'semi-bold', alignSelf:'center' }} key={assignee.username+'1'}>{assignee.firstName} {assignee.lastName}</Text>
                        </View>
                    ))}
                </View>
            )}
            {item.endDate && !item.endTime && <Text style={{ fontSize: 14, marginTop: 10, alignSelf:'center' }}>Due :- {item.endDate}</Text>}
            {item.endDate && item.endTime && <Text style={{ fontSize: 14, marginTop: 10, alignSelf:'center' }}>Due :- {item.endDate} at {item.endTime}</Text>}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                {phaseLoading && <Text>phase Loading ...</Text>}
                {phaseError && ( phaseError.status === 401 ? navigation.navigate('Login') : console.log(phaseError.message))}
                {phaseData && (
                    <View>
                        <Text style={styles.phaseTitle}>{phaseData.phase.title}</Text>
                        <Text style={[styles.phaseStatus, { color: phaseData.phase.status === 'Active' ? '#009900' : '#FF0000' }]}>{phaseData.phase.status}</Text>
                        {phaseData.phase.description && <Text style={styles.phaseDescription}>{phaseData.phase.description}</Text>}
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center' }}>Tasks</Text>
                        {phaseData.phase.tasks.length === 0 && <Text style={{ fontWeight: 'bold', color: '#aaa', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>No Tasks in current Phase</Text>}
                        {phaseData.phase.tasks.map((task) => (<RenderItem key={task.id} item={task} />))}
                        {(phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id)) && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8 }]} onPress={() => navigation.navigate('CreateTask', { phase: phaseData.phase })}>
                                <Text style={styles.lowerButtonText}>Add New Task</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {phaseData && (
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phase Admins</Text>
                        {phaseData.phase.phaseAdmins.length === 0 && <Text style={{ fontWeight: 'bold', color: '#aaa', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>No Admins in current Phase</Text>}
                        {phaseData.phase.phaseAdmins.map((admin) => (
                            <View style={[styles.memberContainer,{ flexDirection: 'row', alignItems: 'center' }]} key={admin.username+'0'}>
                                <Image source={admin.imageURL ? { uri: admin.imageURL } : require('../../images/profile.webp')} style={{ width: 25, height: 25, borderRadius: 25, marginLeft: 5 }} />
                                <View style={{ marginLeft: 15 }} key={admin.username+'2'}>
                                    <Text style={{ fontWeight: 'bold' }} key={admin.username+'1'}>{admin.firstName} {admin.lastName}</Text>
                                    <Text style={{ fontSize: 12, color: '#434343' }} key={admin.username+'3'}>{admin.username}</Text>
                                </View>
                            </View>
                        ))}
                        {(phaseData.phase.process.managers.map((admin) => admin.id).includes(userData.id)) && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => navigation.navigate('UpdatePhaseAdmins', { phase: phaseData.phase, project: project, process: process })}>
                                <Text style={styles.lowerButtonText}>Add/Remove Admins</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phase Members</Text>
                        {phaseData.phase.phaseMembers.length === 0 && <Text style={{ fontWeight: 'bold', color: '#aaa', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>No Members in current Phase</Text>}
                        {phaseData.phase.phaseMembers.map((member) => (
                            <View style={[styles.memberContainer,{ flexDirection: 'row', alignItems: 'center' }]} key={member.username+'0'}>
                                <Image source={member.imageURL ? { uri: member.imageURL } : require('../../images/profile.webp')} style={{ width: 25, height: 25, borderRadius: 25, marginLeft: 5 }} />
                                <View style={{ marginLeft: 15 }} key={member.username+'2'}>
                                    <Text style={{ fontWeight: 'bold' }} key={member.username+'1'}>{member.firstName} {member.lastName}</Text>
                                    <Text style={{ fontSize: 12, color: '#434343' }} key={member.username+'3'}>{member.username}</Text>
                                </View>
                            </View>
                        ))}
                        {(phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id) || phaseData.phase.process.managers.map((manager) => manager.id).includes(userData.id)) && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => navigation.navigate('UpdatePhaseMembers', { phase: phaseData.phase, project: project, process: process })}>
                                <Text style={styles.lowerButtonText}>Add/Remove Members</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                {phaseData && (phaseData.phase.process.managers.map((manager) => manager.id).includes(userData.id) || phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id)) && (
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Edit Phase') }}>
                        <Text style={styles.lowerButtonText}>Edit Phase</Text>
                    </TouchableOpacity>
                )}
                {phaseData && (phaseData.phase.process.managers.map((manager) => manager.id).includes(userData.id)) && (
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#dd0000', borderRadius: 8, marginTop: 8 }]} onPress={() => {
                        // prompt user to confirm deletion
                        Alert.alert(
                            'Delete Phase',
                            'Are you sure you want to delete this phase?',
                            [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancelled'),
                                    style: 'cancel'
                                },
                                {
                                    text: 'Delete', onPress: async () => {
                                        try {
                                            await deletePhase({ variables: { id: phaseId } });
                                            navigation.goBack();
                                        } catch (error) {
                                            Alert.alert('Error', error.message);
                                        }
                                    }
                                }
                            ]
                        );
                    }}>
                        <Text style={styles.lowerButtonText}>Delete Phase</Text>
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
    phaseTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 0,
        marginTop: 20,
        color: '#434343',
        textAlign: 'center'
    },
    phaseStatus: {
        fontSize: 14,
        marginBottom: 5,
        color: '#434343',
        textAlign: 'center'
    },
    phaseDescription: {
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
    taskContainer: {
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
    miniMemberContainer: {
        backgroundColor: '#eee',
        paddingBottom: 0,
        alignItems: 'left',
    },
    lowerButton: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
        // width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lowerButtonText: {
        color: '#fff',
        fontSize: 16,
    },
}

export default PhaseScreen;
