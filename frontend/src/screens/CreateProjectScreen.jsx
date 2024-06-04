import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATE_PROJECT_MUTATION, SEARCH_USERS_MUTATION } from '../queries/Mutations';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import { useState } from 'react';
import { SearchBar } from "react-native-elements"; 
import { UserGlobalState } from '../layout/UserState';
import { logoImagesArray } from '../logoImages';

const CreateProjectScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [members, setMembers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [logo, setLogo] = useState('');
    const { userData, setUserData } = UserGlobalState();
    const [createProject] = useMutation(CREATE_PROJECT_MUTATION);
    const [searchUsers] = useMutation(SEARCH_USERS_MUTATION);

    const createProjectHandler = async () => {
        try {
            const membersIds = members.map(member => member.id);
            const variables = { title: title, description: description, members: membersIds, logo: logo.file };
            const response = await createProject({ variables });
            if (response.data.createProject.id) {
                Alert.alert('Project Created');
                navigation.navigate('Project', { id: response.data.createProject.id, defaultProcess: response.data.createProject.defaultProcess });
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message.split('.').join('.\n');
            Alert.alert('Error', message);
        }
    }

    const searchTextChangeHandler = async (text) => {
        setSearchText(text);
        if (text.length > 0) {
            setSearchLoading(true);
            try {
                const response = await searchUsers({ variables: { searchText: text } });
                setSearchList(response.data.searchUsers);
            } catch (err) {
                const message = err.message.split('.').join('.\n');
                Alert.alert('Error', message);
            }
            setSearchLoading(false);
        } else {
            setSearchList([]);
        }
    }

    const RenderItem = ({ item, cross }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={item.imageURL ? { uri: item.imageURL } : require('../../images/profile.webp')} style={{ width: 20, height: 20, borderRadius: 25 }} />
                <Text style={styles.fullName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.username}> ({item.username})</Text>
                {cross && <Text style={{ color: 'red', fontSize: 20, marginLeft: 'auto' }}>X</Text>}
            </View>
        );
    };

    const renderUserItem = ({ item }) => {
        if (members.some(member => member.id === item.id)) return null;
        if (item.id === userData.id) return null;
        return (
            <TouchableOpacity onPress={() => {
                if (!members.some(member => member.id === item.id)) {
                    setMembers([...members, item]);
                }
            }}  style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} />
            </TouchableOpacity>
        );
    };

    const renderMemberItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                setMembers(members.filter(member => member.id !== item.id));
            }} style={styles.userItemContainer} key={item.id}>
                <RenderItem item={item} cross={true} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.createProjectContainer}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Create Project</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Project Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Project Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '80%' }}>
                    <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', width: '35%' }}>{logo ? 'Logo' : 'Select Logo'}</Text>
                    {!logo ?
                        <ScrollView horizontal={true} style={{ width: '40%' }}>
                            {logoImagesArray.map((obj, index) => (
                                <TouchableOpacity key={index} onPress={() => setLogo(obj)}>
                                    <Image source={obj.image} style={{ width: 50, height: 50, borderRadius: 25, marginHorizontal: 5 }} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    :
                        <Image source={logo.image} style={{ width: 50, height: 50, borderRadius: 25 }} />
                    }
                    {
                        logo && <TouchableOpacity onPress={() => setLogo('')} style={{ width: '35%', alignItems: 'left' }}>
                            <Text style={styles.removeBtn}>Remove</Text>
                        </TouchableOpacity>
                    }
                </View>
                <View style={styles.inputContainer}>
                    <FlatList
                        data={members}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                        ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>Members</Text>}
                    />
                    <SearchBar
                        placeholder="Search for Users"
                        onChangeText={searchTextChangeHandler}
                        value={searchText}
                        onClear={() => setSearchList([])}
                        containerStyle={{ backgroundColor: 'transparent', borderColor: 'transparent', width: '80%' }}
                        inputContainerStyle={{ backgroundColor: '#eee' }}
                        inputStyle={{ color: '#000', fontSize: 14 }}
                        leftIconContainerStyle={{ paddingLeft: 5 }}
                        lightTheme={true}
                        round={true}
                        showCancel={searchText.length > 0}
                        showLoading={searchLoading}
                    />
                    <FlatList
                        data={searchList}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                    />
                </View>
                <View style={styles.rowButtonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={createProjectHandler}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    createProjectContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CBB17',
    },
    innerContainer: {
        width: '90%',
        height: '90%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        marginTop: '12%',
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginTop: '5%',
        alignItems: 'center',
        marginBottom: '6%',
        width: '100%',
    },
    input: {
        width: '80%',
        height: 35,
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

export default CreateProjectScreen;