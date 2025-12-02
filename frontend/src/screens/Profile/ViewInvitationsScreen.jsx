import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RESPOND_REQUEST_MUTATION, DELETE_REQUEST_MUTATION } from '../../graphql/Mutations';
import { RECEIVED_REQUESTS_QUERY } from '../../graphql/Queries';
import { useMutation, useQuery } from '@apollo/client';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const ViewInvitationsScreen = ({ navigation, route }) => {
    const [respondRequest] = useMutation(RESPOND_REQUEST_MUTATION);
    const [deleteRequest] = useMutation(DELETE_REQUEST_MUTATION);
    const { data:requestsData, loading:requestsLoading, error:requestsError } = useQuery(RECEIVED_REQUESTS_QUERY, { fetchPolicy: 'network-only' });

    const respondRequestHandler = async (requestId, status) => {
        try {
            if (!requestId || !status) {
                Alert.alert('An error occurred, please try again');
                return;
            }
            const variables = { id: requestId, status: status };
            const response = await respondRequest({ variables: variables });
            if (response?.data?.respondRequest?.id) {
                if (response.data.respondRequest.status === 'Accepted') {
                    Alert.alert('Request Accepted');
                    navigation.navigate('ViewInvitations');
                } else if (response.data.respondRequest.status === 'Rejected') {
                    Alert.alert('Request Rejected');
                    navigation.navigate('ViewInvitations');
                } else {
                    Alert.alert('Could not respond to request');
                    return;
                }
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
            Alert.alert('Error', message);
        }
    }

    const deleteRequestHandler = async (requestId) => {
        try {
            if (!requestId) {
                Alert.alert('An error occurred, please try again');
                return;
            }
            const variables = { id: requestId };
            const response = await deleteRequest({ variables: variables });
            if (response.data.deleteRequest) {
                Alert.alert('Request Deleted');
                navigation.navigate('ViewInvitations');
            } else {
                Alert.alert('An error occurred, please try again');
            }
        } catch (err) {
            console.log(err);
            // separate each sentence into new line in err.message
            const message = err.message ? err.message.split('.').join('.\n') : 'An unexpected error occurred';
            Alert.alert('Error', message);
        }
    }

    const requestItem = ({ item }) => {
        return (
            <Card style={styles.requestCard}>
                <Text style={styles.contentText}>
                    {item.project.owner.firstName} {item.project.owner.lastName} (@{item.project.owner.username}) invites you to join project "{item.project.title}"
                </Text>
                {item.status === 'Pending' && (
                    <View style={styles.buttonRow}>
                        <Button
                            onPress={() => respondRequestHandler(item.id, 'Accepted')}
                            style={styles.actionButton}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="outline"
                            onPress={() => respondRequestHandler(item.id, 'Rejected')}
                            style={styles.actionButton}
                        >
                            Reject
                        </Button>
                    </View>
                )}
                {(item.status === 'Accepted' || item.status === 'Rejected') && (
                    <View style={styles.statusRow}>
                        <Badge
                            label={`Request ${item.status}`}
                            variant={item.status === 'Accepted' ? 'success' : 'error'}
                        />
                        <Button
                            variant="error"
                            onPress={() => {
                                Alert.alert('Delete Request', 'Are you sure you want to delete this request?', [
                                    { text: 'Cancel', onPress: () => {} },
                                    { text: 'Delete', onPress: () => deleteRequestHandler(item.id) }
                                ]);
                            }}
                            style={styles.deleteButton}
                        >
                            Delete
                        </Button>
                    </View>
                )}
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Project Invitations</Text>
                <FlatList
                    data={requestsData ? requestsData.receivedRequests : []}
                    renderItem={requestItem}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={8}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Card style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No invitations</Text>
                        </Card>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    innerContainer: {
        flex: 1,
        padding: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginVertical: spacing.lg,
        lineHeight: typography.lineHeight.tight * typography.fontSize['2xl'],
    },
    listContent: {
        gap: spacing.md,
    },
    requestCard: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    contentText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.md,
        lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    actionButton: {
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    deleteButton: {
        flex: 0,
        minWidth: 100,
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        fontStyle: 'italic',
    },
});

export default ViewInvitationsScreen;