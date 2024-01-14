import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ONE_PROJECT_QUERY, PROCESS_QUERY } from '../queries/Queries'; // Import your GraphQL queries
import { useQuery } from '@apollo/client';

const ProjectScreen = ({navigation, route}) => {

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
          <Text style={styles.itemText}>{item.title}</Text>
        </TouchableOpacity>
      );

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            {projectLoading && <Text>project Loading ...</Text>}
            {projectError && ( projectError.status === 401 ? navigation.navigate('Login') : console.log(projectError.message))}

            {processLoading && <Text>process Loading ...</Text>}
            {processError && ( processError.status === 401 ? navigation.navigate('Login') : console.log(processError.message))}        

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
                    <Text>process : </Text>
                    <Text>title : {processData.process.title}</Text>
                    <Text>description : {processData.process.description}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = {
    item: {
        backgroundColor: '#3498db',
        padding: 10,
        margin: 5,
        borderRadius: 5,
      },
      selectedItem: {
        backgroundColor: '#2ecc71',
      },
      itemText: {
        color: '#fff',
      }
}

export default ProjectScreen;
