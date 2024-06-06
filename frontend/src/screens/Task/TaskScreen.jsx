import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TASK_QUERY } from '../../graphql/Queries';
import { DELETE_TASK_MUTATION } from '../../graphql/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import { UserGlobalState } from '../../layout/UserState';

const TaskScreen = ({navigation, route}) => {
    const taskId = route.params.task.id;
    const phase = route.params.phase;
    const { userData } = UserGlobalState();
    const { data:taskData, loading:taskLoading, error:taskError } = useQuery(TASK_QUERY, { variables: { id: taskId }, fetchPolicy: 'network-only' });
    const [deleteTask] = useMutation(DELETE_TASK_MUTATION);

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
                            {taskData.task.endDate && !taskData.task.endTime && <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5, alignSelf: 'center' }}>Due :- {taskData.task.endDate}</Text>}
                            {taskData.task.endDate && taskData.task.endTime && <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5, alignSelf: 'center' }}>Due :- {taskData.task.endDate} at {taskData.task.endTime}</Text>}
                            <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center' }}>Assignees</Text>
                            {taskData.task.taskAssignees.length === 0 && <Text style={{ fontWeight: 'bold', color: '#aaa', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 8 }}>No Assignees For This Task</Text>}
                            {taskData.task.taskAssignees.length > 0 && (
                                <View>
                                    {taskData.task.taskAssignees.map((assignee) => (
                                        <View style={[styles.memberContainer,{ flexDirection: 'row', alignItems: 'center' }]} key={assignee.username+'0'}>
                                            <Image source={assignee.imageURL ? { uri: assignee.imageURL } : require('../../../images/profile.webp')} style={{ width: 25, height: 25, borderRadius: 25, marginLeft: 5 }} />
                                            <View style={{ marginLeft: 15 }} key={assignee.username+'2'}>
                                                <Text style={{ fontWeight: 'bold' }} key={assignee.username+'1'}>{assignee.firstName} {assignee.lastName}</Text>
                                                <Text style={{ fontSize: 12, color: '#434343' }} key={assignee.username+'3'}>{assignee.username}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8 }]} onPress={() => navigation.navigate('UpdateTaskAssignees', { task: taskData.task, phase: route.params.phase })}>
                                <Text style={styles.lowerButtonText}>Assign/Unassign Task</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#007BFF', borderRadius: 8, marginTop: 8 }]} onPress={() => { console.log('Edit Task') }}>
                        <Text style={styles.lowerButtonText}>Edit Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.lowerButton, { backgroundColor: '#dd0000', borderRadius: 8, marginTop: 8 }]} onPress={() => {
                        // prompt user to confirm deletion
                        Alert.alert(
                            'Delete Task',
                            'Are you sure you want to delete this task?',
                            [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancelled'),
                                    style: 'cancel'
                                },
                                {
                                    text: 'Delete', onPress: async () => {
                                        try {
                                            await deleteTask({ variables: { id: taskId } });
                                            navigation.goBack();
                                        } catch (error) {
                                            Alert.alert('Error', error.message);
                                        }
                                    }
                                }
                            ]
                        );
                    }}>
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

export default TaskScreen;
