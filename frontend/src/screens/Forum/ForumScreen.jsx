import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PROJECTS_QUERY } from '../../graphql/Queries';
import { useQuery } from '@apollo/client';
import { getLogoImage } from '../../logoImages';

const ForumScreen = ({ navigation }) => {
    const { data, loading, error } = useQuery(PROJECTS_QUERY);

    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Posts', { projectId: item.id, projectTitle: item.title })}
                style={styles.itemContainer} key={item.id}
            >
                <View style={styles.ImageContainer}>
                    <Image source={getLogoImage(item.logo)} style={styles.imageItem} />
                </View>
                <View>
                    <Text style={styles.projectTitle}>{item.title}</Text>
                    <Text style={styles.projectDescription}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
            {loading && <Text>Loading projects...</Text>}
            {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
            {data && (
                <View>
                <FlatList
                    data={data.projects}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={RenderItem}
                />
                </View>
            )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4CBB17',
        paddingHorizontal: '4%',
    },
    innerContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: '#4CBB17',
        paddingHorizontal: '2%',
    },
    itemContainer: {
        paddingTop: 8,
        paddingBottom: 12,
        marginBottom: 5,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 25,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#434343'
    },
    projectDescription: {
        maxWidth: '87%',
        fontSize: 14,
        color: '#434343'
    },
    projectStatus: {
        fontSize: 15,
        color: '#434343'
    },
    memberItem: {
        margin: 10,
    },
    ImageContainer: {
        margin: 13,
        marginTop: 15,
    },
    imageItem: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    createForumButton: {
        backgroundColor: '#6BB64a',
        padding: 9,
        margin: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    }
});

export default ForumScreen;
