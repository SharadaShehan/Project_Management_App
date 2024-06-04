import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PHASE_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';

const PhaseScreen = ({navigation, route}) => {
    const project = route.params.project;
    const phaseId = route.params.id;
    const projectMembers = route.params.projectMembers;

    const { userData } = UserGlobalState();
    const { data:phaseData, loading:phaseLoading, error:phaseError } = useQuery(PHASE_QUERY, { variables: { id: phaseId } });

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.taskContainer} disabled={phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id) ? false : true}
            onPress={() => { console.log('Task Pressed') }}>
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ fontSize: 12, color: '#434343' }}>{item.status}</Text>
            <Text>{item.description}</Text>
            {item.endDate && !item.endTime && <Text>Due: {item.endDate}</Text>}
            {item.endDate && item.endTime && <Text>Due: {item.endDate} at {item.endTime}</Text>}
            {item.taskAssignees.length === 0 && <Text>No Assignees</Text>}
            {item.taskAssignees.length > 0 && (
                <View>
                    <Text>Assignees:</Text>
                    {item.taskAssignees.map((assignee) => (
                        <View style={styles.memberContainer} key={assignee.username+'0'}>
                            <Text style={{ fontWeight: 'bold' }} key={assignee.username+'1'}>{assignee.firstName} {assignee.lastName}</Text>
                            <Text style={{ fontSize: 12, color: '#434343' }} key={assignee.username+'3'}>{assignee.username}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                {phaseLoading && <Text>phase Loading ...</Text>}
                {phaseError && ( phaseError.status === 401 ? navigation.navigate('Login') : console.log(phaseError.message))}

                {phaseLoading && <Text>phase Loading ...</Text>}
                {phaseError && ( phaseError.status === 401 ? navigation.navigate('Login') : console.log(phaseError.message))}        

                {phaseData && (
                    <View>
                        <Text style={styles.phaseTitle}>{phaseData.phase.title}</Text>
                        <Text style={[styles.phaseStatus, { color: phaseData.phase.status === 'Active' ? '#009900' : '#FF0000' }]}>{phaseData.phase.status}</Text>
                        <Text style={styles.phaseDescription}>{phaseData.phase.description}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <FlatList
                                data={phaseData.phase.tasks}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Tasks</Text>)}
                            />
                            {(phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id)) && (
                                <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8 }]} onPress={() => { console.log('Add Task') }}>
                                    <Text style={styles.lowerButtonText}>Add New Task</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {phaseData && (
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phase Admins</Text>
                        {phaseData.phase.phaseAdmins.map((admin) => (
                            <View style={styles.memberContainer} key={admin.username+'0'}>
                                <Text style={{ fontWeight: 'bold' }} key={admin.username+'1'}>{admin.firstName} {admin.lastName}</Text>
                                <Text style={{ fontSize: 12, color: '#434343' }} key={admin.username+'3'}>{admin.username}</Text>
                            </View>
                        ))}
                        {(phaseData.phase.process.managers.map((manager) => manager.id).includes(userData.id)) && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Add/Remove Admins') }}>
                                <Text style={styles.lowerButtonText}>Add/Remove Admins</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Phase Members</Text>
                        {phaseData.phase.phaseMembers.map((member) => (
                            <View style={styles.memberContainer} key={member.username+'0'}>
                                <Text style={{ fontWeight: 'bold' }} key={member.username+'1'}>{member.firstName} {member.lastName}</Text>
                                <Text style={{ fontSize: 12, color: '#434343' }} key={member.username+'3'}>{member.username}</Text>
                            </View>
                        ))}
                        {(phaseData.phase.phaseAdmins.map((admin) => admin.id).includes(userData.id) || phaseData.phase.process.managers.map((manager) => manager.id).includes(userData.id)) && (
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Add/Remove Members') }}>
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
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#dd0000', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Delete Phase') }}>
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
