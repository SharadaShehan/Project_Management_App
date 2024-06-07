// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProjectScreen from './screens/Project/ProjectScreen';
import CreateProjectScreen from './screens/Project/CreateProjectScreen';
import InviteUsersScreen from './screens/Project/InviteUsersScreen';
import RemoveMemberScreen from './screens/Project/RemoveMemberScreen';
import EditProjectScreen from './screens/Project/EditProjectScreen';
import CreateProcessScreen from './screens/Process/CreateProcessScreen';
import UpdateProcessManagers from './screens/Process/UpdateProcessManagers';
import EditProcessScreen from './screens/Process/EditProcessScreen';
import PhaseScreen from './screens/Phase/PhaseScreen';
import CreatePhaseScreen from './screens/Phase/CreatePhaseScreen';
import UpdatePhaseMembers from './screens/Phase/UpdatePhaseMembers';
import UpdatePhaseAdmins from './screens/Phase/UpdatePhaseAdmins';
import EditPhaseScreen from './screens/Phase/EditPhaseScreen';
import TaskScreen from './screens/Task/TaskScreen';
import CreateTaskScreen from './screens/Task/CreateTaskScreen';
import UpdateTaskAssignees from './screens/Task/UpdateTaskAssignees';
import EditTaskScreen from './screens/Task/EditTaskScreen';
import PhaseChatScreen from './screens/Chat/PhaseChatScreen';
import ProjectChatScreen from './screens/Chat/ProjectChatScreen';
import PrivateChatScreen from './screens/Chat/PrivateChatScreen';
import NewChatScreen from './screens/Chat/NewChatScreen';
import PostsScreen from './screens/Forum/PostsScreen';
import PostScreen from './screens/Forum/PostScreen';
import CreatePostScreen from './screens/Forum/CreatePostScreen';
import ViewInvitationsScreen from './screens/Profile/ViewInvitationsScreen';
import UpdateProfileScreen from './screens/Profile/UpdateProfileScreen';
import ChangePasswordScreen from './screens/Profile/ChangePasswordScreen';
import { UserGlobalStateProvider } from './layout/UserState';
import { MessagesGlobalStateProvider } from './layout/MessagesState';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <UserGlobalStateProvider>
    <MessagesGlobalStateProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{headerTitleAlign: 'center'}}>
          <Stack.Screen name="Login" component={LoginScreen}
                        options={{ headerShown: false }}/>
          <Stack.Screen name="SignUp" component={SignUpScreen}
                        options={{ headerShown: false }}/>
          <Stack.Screen name="Home" component={HomeScreen} 
                        options={{ headerShown: false }}/>
          <Stack.Screen name="Project" component={ProjectScreen}
                        options={{
                          headerStyle: {
                            backgroundColor: '#228B22',
                            fontWeight: 'bold'
                          },
                          headerTintColor: '#fff'
                        }}/>
          <Stack.Screen name="CreateProject" component={CreateProjectScreen}
                        options={{ headerShown: false }}/>
          <Stack.Screen name="InviteUsers" component={InviteUsersScreen}
                        options={{
                          title: 'Invite Users',
                          headerStyle: {
                            backgroundColor: '#228B22',
                            fontWeight: 'bold',
                          },
                          headerTintColor: '#fff'
                        }}/>
          <Stack.Screen name="RemoveMember" component={RemoveMemberScreen}
                        options={{
                          title: 'Remove Member',
                          headerStyle: {
                            backgroundColor: '#228B22',
                            fontWeight: 'bold',
                          },
                          headerTintColor: '#fff'
                        }}/>
          <Stack.Screen name="EditProject" component={EditProjectScreen}
                        options={{
                          title: 'Edit Project',
                          headerStyle: {
                            backgroundColor: '#228B22',
                            fontWeight: 'bold',
                          },
                          headerTintColor: '#fff'
                        }}/>
          <Stack.Screen name="CreateProcess" component={CreateProcessScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.project.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="UpdateProcessManagers" component={UpdateProcessManagers}
                        options={
                          ({ route }) => ({
                            title: route.params.process.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="EditProcess" component={EditProcessScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.process.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="Phase" component={PhaseScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.process.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="CreatePhase" component={CreatePhaseScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.process.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="UpdatePhaseMembers" component={UpdatePhaseMembers}
                        options={
                          ({ route }) => ({
                            title: route.params.phase.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="UpdatePhaseAdmins" component={UpdatePhaseAdmins}
                        options={
                          ({ route }) => ({
                            title: route.params.phase.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="EditPhase" component={EditPhaseScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.phase.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="Task" component={TaskScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.phase.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="CreateTask" component={CreateTaskScreen}
                        options={
                          ({ route }) => ({
                            headerStyle: {
                              title: route.params.phase.title,
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="UpdateTaskAssignees" component={UpdateTaskAssignees}
                        options={
                          ({ route }) => ({
                            title: route.params.task.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="EditTask" component={EditTaskScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.task.title,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="PhaseChat" component={PhaseChatScreen}
                        options={
                          ({ route }) => ({
                            headerStyle: {
                              backgroundColor: '#6BB64a',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="ProjectChat" component={ProjectChatScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.project.title,
                            headerStyle: {
                              backgroundColor: '#6BB64a',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="PrivateChat" component={PrivateChatScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.user.firstName + ' ' + route.params.user.lastName,
                            headerStyle: {
                              backgroundColor: '#6BB64a',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })
                        }/>
          <Stack.Screen name="NewChat" component={NewChatScreen}
                        options={
                          ({ route }) => ({
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })}
                        />
          <Stack.Screen name="Posts" component={PostsScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.projectTitle,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })}
                        />
          <Stack.Screen name="Post" component={PostScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.projectTitle,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })}
                        />
          <Stack.Screen name="CreatePost" component={CreatePostScreen}
                        options={
                          ({ route }) => ({
                            title: route.params.projectTitle,
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })}
                        />
          <Stack.Screen name="ViewInvitations" component={ViewInvitationsScreen}
                        options={
                          ({ route }) => ({
                            title: 'Invitations',
                            headerStyle: {
                              backgroundColor: '#228B22',
                              fontWeight: 'bold',
                            },
                            headerTintColor: '#fff'
                          })}
                        />
          <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen}
                        options={{ headerShown: false }}/>
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}
                        options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </MessagesGlobalStateProvider>
    </UserGlobalStateProvider>
  );
};


export default AppNavigator;

