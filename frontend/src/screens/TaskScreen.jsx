import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TASK_QUERY } from '../queries/Queries';
import { useQuery } from '@apollo/client';
import { UserGlobalState } from '../layout/UserState';

const TaskScreen = ({navigation, route}) => {
    const taskId = route.params.id;
    const { userData } = UserGlobalState();
    const { data:taskData, loading:taskLoading, error:taskError } = useQuery(TASK_QUERY, { variables: { id: taskId } });

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
                    {taskLoading && <Text>task Loading ...</Text>}
                    {taskError && ( taskError.status === 401 ? navigation.navigate('Login') : console.log(taskError.message))}
                    {taskData && (
                        <View>
                            <Text style={styles.taskTitle}>{taskData.task.title}</Text>
                            <Text style={[styles.taskStatus, { color: taskData.task.status === 'Active' ? '#009900' : '#FF0000' }]}>{taskData.task.status}</Text>
                            {taskData.task.description && <Text style={styles.taskDescription}>{taskData.task.description}</Text>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <FlatList
                                    data={taskData.task.taskAssignees}
                                    renderItem={renderItem}
                                    keyExtractor={(item) => item.id}
                                    ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Assignees</Text>)}
                                />
                                <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8 }]} onPress={() => { console.log('Add Task') }}>
                                    <Text style={styles.lowerButtonText}>Assign/Unassign Task</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Edit Task') }}>
                        <Text style={styles.lowerButtonText}>Edit Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#dd0000', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Delete Task') }}>
                        <Text style={styles.lowerButtonText}>Delete Task</Text>
                    </TouchableOpacity>
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
    taskTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 0,
        marginTop: 20,
        color: '#434343',
        textAlign: 'center'
    },
    taskStatus: {
        fontSize: 14,
        marginBottom: 5,
        color: '#434343',
        textAlign: 'center'
    },
    taskDescription: {
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

export default TaskScreen;
