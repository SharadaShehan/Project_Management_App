import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MessagesGlobalState } from '../../layout/MessagesState';
import { UserGlobalState } from '../../layout/UserState';
import { getLogoImage } from '../../logoImages';
import { Card, Avatar } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const MessagesScreen = ({ navigation }) => {
    const mLimit = 100;
    const { messagesData, setMessagesData } = MessagesGlobalState();
    const { userData, setUserData } = UserGlobalState();
    let otherUser;

    const renderItem = ({ item }) => {
        if (!item || item.length === 0) return null;
        const firstItem = item[0];
        if (firstItem && firstItem.receiver) {
            if (firstItem.receiver.id === userData.id) {
                otherUser = firstItem.sender; 
            } else {
                otherUser = firstItem.receiver;
            }
        }
        const dateObj = new Date(parseInt(firstItem.createdAt));
        let convertedDate;
        if (dateObj.getDate() === new Date().getDate()) {
            convertedDate = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        } else if (dateObj.getDate() === new Date().getDate() - 1) {
            convertedDate = 'Yesterday';
        } else if (dateObj.getFullYear() !== new Date().getFullYear()) {
            convertedDate = dateObj.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
            convertedDate = dateObj.toLocaleString('en-US', { month: 'long', day: 'numeric' });
        }

        let avatarSource, chatTitle, messagePreview;
        if (firstItem.project && !firstItem.phase) {
            avatarSource = getLogoImage(firstItem.project.logo);
            chatTitle = firstItem.project.title;
        } else if (firstItem.phase) {
            avatarSource = getLogoImage(firstItem.project.logo);
            chatTitle = `${firstItem.project.title}: ${firstItem.phase.title}`;
        } else if (firstItem.receiver) {
            avatarSource = otherUser.imageURL ? { uri: otherUser.imageURL } : require('../../../images/profile.webp');
            chatTitle = `${otherUser.firstName} ${otherUser.lastName}`;
        }

        if (firstItem.sender && (firstItem.phase || firstItem.project)) {
            messagePreview = `${firstItem.sender.firstName} ${firstItem.sender.lastName}: ${firstItem.content}`;
        } else if (firstItem.receiver) {
            messagePreview = firstItem.content;
        }

        return (
            <Card 
                style={styles.messageCard}
                variant="outlined"
                onPress={() => {
                    if (firstItem.phase) navigation.navigate('PhaseChat', { phase: firstItem.phase, lastMessageIndex: firstItem.index, limit: mLimit })
                    else if (firstItem.project) navigation.navigate('ProjectChat', { project: firstItem.project, lastMessageIndex: firstItem.index, limit: mLimit })
                    else {
                        if (firstItem.sender.id === userData.id) navigation.navigate('PrivateChat', { user: firstItem.receiver, lastMessageIndex: firstItem.index, limit: mLimit })
                        else if ((firstItem.receiver.id === userData.id)) navigation.navigate('PrivateChat', { user: firstItem.sender, lastMessageIndex: firstItem.index, limit: mLimit })
                        else console.log('invalid message');
                    }
                }}
            >
                <View style={styles.messageContent}>
                    <Avatar 
                        source={avatarSource}
                        name={chatTitle}
                        size="md"
                    />
                    <View style={styles.messageInfo}>
                        <View style={styles.messageHeader}>
                            <Text style={styles.chatTitle} numberOfLines={1}>{chatTitle}</Text>
                            <Text style={styles.timestamp}>{convertedDate}</Text>
                        </View>
                        <Text style={styles.messagePreview} numberOfLines={2}>{messagePreview}</Text>
                    </View>
                </View>
            </Card>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={messagesData.filter((item) => item.length > 0)}
                renderItem={renderItem}
                keyExtractor={(item) => item[0].id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity 
                onPress={() => navigation.navigate('NewChat')} 
                style={styles.fab}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={28} color={colors.text.inverse} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    listContent: {
        padding: spacing.lg,
    },
    messageCard: {
        marginBottom: spacing.md,
        borderWidth: 0,
    },
    messageContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    messageInfo: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    chatTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        flex: 1,
        marginRight: spacing.sm,
    },
    timestamp: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    messagePreview: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
})

export default MessagesScreen;
