import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSIGN_TASK_MUTATION, UNASSIGN_TASK_MUTATION } from '../../graphql/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { UserGlobalState } from '../../layout/UserState';

const UpdateTaskAssignees = ({ navigation, route }) => {
    const taskId = route.params.task.id;
    const currentAssignees = route.params.task.taskAssignees || [];
    const phaseMembers = route.params.phase.phaseMembers || [];
    const [assigneesToAdd, setAssigneesToAdd] = useState([]);
    const [assigneesToRemove, setAssigneesToRemove] = useState([]);
    const [shownAssignees, setShownAssignees] = useState([]);
    const [shownNonAssignees, setShownNonAssignees] = useState([]);
    const { userData, setUserData } = UserGlobalState();
    const [assignTask] = useMutation(ASSIGN_TASK_MUTATION);
    const [unassignTask] = useMutation(UNASSIGN_TASK_MUTATION);

    useEffect(() => {
        setShownAssignees([...assigneesToAdd, ...currentAssignees].filter(assignee => !assigneesToRemove.some(m => m.id === assignee.id)));
        const tempManagers = [...assigneesToAdd, ...currentAssignees].filter(assignee => !assigneesToRemove.some(m => m.id === assignee.id));
        setShownNonAssignees(phaseMembers.filter(member => !tempManagers.some(assignee => assignee.id === member.id)));
    }, [assigneesToAdd, assigneesToRemove]);
    
    const updateTaskAssigneesHandler = async () => {
        try {
            if (!taskId) {
                Alert.alert('Task ID not found');
                return;
            } else if (assigneesToAdd.length === 0 && assigneesToRemove.length === 0) {
                Alert.alert('No changes made');
                return;
            } else {
                if (assigneesToAdd.length > 0) {
                    const response = await assignTask({ variables: { id: taskId, assignees: assigneesToAdd.map(assignee => assignee.id) } });
                    if (!response.data.assignTask.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                if (assigneesToRemove.length > 0) {
                    const response = await unassignTask({ variables: { id: taskId, assignees: assigneesToRemove.map(assignee => assignee.id) } });
                    if (!response.data.unassignTask.id) {
                        Alert.alert('An error occurred, please try again');
                        return;
                    }
                }
                Alert.alert('Task Assignees Updated');
                navigation.goBack();
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message.split('.').join('.\n');
            Alert.alert('Error', message);
        }
    }

    const RenderItem = ({ item, cross }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={item.imageURL ? { uri: item.imageURL } : require('../../../images/profile.webp')} style={{ width: 20, height: 20, borderRadius: 25 }} />
                <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.username}> ({item.username})</Text>
                {cross && <Text style={{ color: 'red', fontSize: 20, marginLeft: 'auto' }}>X</Text>}
            </View>
        );
    };

    const renderAssigneeItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (assigneesToAdd.some(assignee => assignee.id === item.id)) {
                    setAssigneesToAdd(assigneesToAdd.filter(assignee => assignee.id !== item.id));
                } else {
                    setAssigneesToRemove([...assigneesToRemove, item]);
                }
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (assigneesToRemove.some(assignee => assignee.id === item.id)) {
                    setAssigneesToRemove(assigneesToRemove.filter(assignee => assignee.id !== item.id));
                } else {
                    setAssigneesToAdd([...assigneesToAdd, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };
    
    return (
        <SafeAreaView style={styles.updateAssigneesContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Update Task Assignees</Text>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={shownAssignees}
                        renderItem={renderAssigneeItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Managers</Text>)}
                    />
                    <FlatList
                        data={shownNonAssignees}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={() => (<Text style={{ fontWeight: 'semi-bold', fontSize: 14, marginTop: 10, alignSelf: 'center', marginBottom: 3 }}>Add Managers from Project Members</Text>)}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={updateTaskAssigneesHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    updateAssigneesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '95%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        marginTop: '3%',
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginTop: '5%',
        alignItems: 'center',
        marginBottom: '4%',
        width: '100%',
    },
    input: {
        width: '80%',
        height: 28,
        borderColor: '#007BFF',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        // borderRadius: 10,
        marginBottom: '5%',
        padding: 5,
    },
    removeBtn: {
        color: 'white',
        backgroundColor: 'red',
        padding: 3,
        width: '80%',
        borderRadius: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 5,
    },
    userItemContainer: {
        padding: 10,
        backgroundColor: '#eee',
        marginVertical: 2,
        borderRadius: 15,
        width: '100%',
    },
    fullName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#434343',
        paddingLeft: 8,
    },
    username: {
        fontSize: 12,
        color: '#434343',
        paddingRight: 8,
    },
    rowButtonsContainer: {
        marginTop: '2%',
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        width: '44%',
        alignSelf: 'center',
        marginHorizontal: '3%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default UpdateTaskAssignees;
