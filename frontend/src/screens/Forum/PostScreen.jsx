import React , { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Alert } from 'react-native';
import { POST_QUERY } from '../../graphql/Queries';
import { UPVOTE_POST_MUTATION, DOWNVOTE_POST_MUTATION, UPVOTE_REPLY_MUTATION, DOWNVOTE_REPLY_MUTATION, REPLY_POST_MUTATION, DELETE_POST_MUTATION, GET_GEMINI_RESPONSE_FOR_POST_MUTATION } from '../../graphql/Mutations';
import { useQuery, useMutation } from '@apollo/client';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserGlobalState } from '../../layout/UserState';

const PostScreen = ({ navigation, route }) => {
    const [ upvoted, setUpvoted ] = useState(false);
    const [ upvoteCount, setUpvoteCount ] = useState(0);
    const [ votedForReplies, setVotedForReplies ] = useState([]);
    const [ votedForRepliesCount, setVotedForRepliesCount ] = useState([]);
    const [ commentBoxVisible, setCommentBoxVisible ] = useState(false);
    const [ textInput, setTextInput ] = useState('');
    const { userData, setUserData } = UserGlobalState();
    const [ generatedAnswer, setGeneratedAnswer ] = useState('AI generated answer: \n');
    const [ generatedAnswerLoading, setGeneratedAnswerLoading ] = useState(false);
    const [ generatedAnswerVisible, setGeneratedAnswerVisible ] = useState(false);
    const { data, loading, error } = useQuery(POST_QUERY, {
        variables: { id: route.params.id },
        fetchPolicy: 'network-only',
    });
    const [ upvotePost, { data:upvotedPost, loading:upvotedPostLoading, error:upvotedPostError } ] = useMutation(UPVOTE_POST_MUTATION);
    const [ downvotePost, { data:downvotedPost, loading:downvotedPostLoading, error:downvotedPostError } ] = useMutation(DOWNVOTE_POST_MUTATION);
    const [ upvoteReply, { data:upvotedReply, loading:upvotedReplyLoading, error:upvotedReplyError } ] = useMutation(UPVOTE_REPLY_MUTATION);
    const [ downvoteReply, { data:downvotedReply, loading:downvotedReplyLoading, error:downvotedReplyError } ] = useMutation(DOWNVOTE_REPLY_MUTATION);
    const [ replyPost, { data:createdReply, loading:createdReplyLoading, error:createdReplyError } ] = useMutation(REPLY_POST_MUTATION);
    const [ deletePost, { data:deletedPost, loading:deletedPostLoading, error:deletedPostError } ] = useMutation(DELETE_POST_MUTATION);
    const [ getGeminiResponseForPost, { data:geminiResponse, loading:geminiResponseLoading, error:geminiResponseError } ] = useMutation(GET_GEMINI_RESPONSE_FOR_POST_MUTATION);

    const RenderItem = ({ item, index }) => {
        const datetimeObj = new Date(parseInt(item.createdAt));
        const convertedDatetime = datetimeObj.toLocaleString();
        const options = { month: 'long', day: 'numeric', hour12: true };
        const date = datetimeObj.toLocaleDateString('en-US', options);
        const shortenedDate = date.split(' ')[0].slice(0, 3) + ' ' + date.split(' ')[1];
        const time = convertedDatetime.split(',')[1];
        const timeWithoutSeconds = time.split(':').slice(0, 2).join(':') + ' ' + time.split(' ')[2];
        const isDateToday = date === (new Date()).toLocaleDateString('en-US', options);
        let datetimeOutput;
        if (isDateToday) {
            datetimeOutput = timeWithoutSeconds;
        } else {
            datetimeOutput = shortenedDate;
        }

        return (
            <View style={styles.itemContainer} key={item.id}>
                <View style={styles.itemContentContainer}>
                    <Text style={styles.replyUser}>{item.owner.firstName} {item.owner.lastName}</Text>
                    <Text style={styles.replyMsg}>{item.content}</Text>
                    
                </View>
                <View style={styles.votesContainer}>
                <Text style={styles.replyDatetime}>{datetimeOutput}  |  </Text>
                    <Text style={styles.postUpvotes}>Upvotes: {votedForRepliesCount[index]}  |</Text>
                    <TouchableOpacity style={[styles.upvoteButton]}
                        onPress={ async () => {
                            try {
                                if (votedForReplies[index]) {
                                    const response = await downvoteReply({ variables: { id: item.id } });
                                    if (response.data.downvoteReply) {
                                        setVotedForReplies(votedForReplies.map((reply, i) => i === index ? false : reply));
                                        setVotedForRepliesCount(votedForRepliesCount.map((count, i) => i === index ? count - 1 : count));
                                    }
                                } else {
                                    const response = await upvoteReply({ variables: { id: item.id } });
                                    if (response.data.upvoteReply) {
                                        setVotedForReplies(votedForReplies.map((reply, i) => i === index ? true : reply));
                                        setVotedForRepliesCount(votedForRepliesCount.map((count, i) => i === index ? count + 1 : count));
                                    }
                                }
                                console.log(votedForReplies);
                            } catch (err) {
                                console.log(err);
                            }}
                        }>
                        <MIcon name='arrow-up-bold' size={28} color={votedForReplies[index] ? '#6BB64a' : '#d8d8d8'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    useEffect(() => {
        if (data) {
            setUpvoted(data.post.upvotedUsers.some((user) => user.id === userData.id));
            setUpvoteCount(data.post.upvotes);
            setVotedForReplies(data.post.replies.map((reply) => reply.upvotedUsers.some((user) => user.id === userData.id)));
            setVotedForRepliesCount(data.post.replies.map((reply) => reply.upvotes));
        }
    }, [data]);

    const deletePostHandler = async () => {
        try {
            const response = await deletePost({ variables: { id: data.post.id } });
            if (response.data.deletePost) {
                navigation.navigate('Posts', { projectId: data.post.project.id, projectTitle: data.post.project.title });
            } else {
                Alert.alert('Error', 'Could not delete post.');
            }
        } catch (err) {
            console.log(err);
            const message = err.message.split('.').join('.\n');
            Alert.alert('Error', message);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.postsContainer}>
            {loading && <Text>Loading Post...</Text>}
            {error && ( error.status === 401 ? navigation.navigate('Login') : console.log(error.message))}
            {error && error.status !== 401 && navigation.navigate('Posts', { projectId: route.params.id, projectTitle: route.params.projectTitle })}
            {data && (
                <View style={{ flex: 1 }}>
                    <Text style={styles.postAuthor}>{data.post.owner.firstName} {data.post.owner.lastName}  </Text>
                    <Text style={styles.postDate}>{(new Date(parseInt(data.post.createdAt))).toLocaleString('en-US', { month: 'long', day: 'numeric' })}</Text>
                    <Text style={styles.projectTitle}>{data.post.project.title}</Text>
                    <Text style={styles.postTitle}>{data.post.title}</Text>
                    
                    <Text style={styles.postContent}>{data.post.content}</Text>
                    <View style={styles.votesContainer}>
                        <Text style={styles.postUpvotes}>Upvotes: {upvoteCount}  |</Text>
                        <TouchableOpacity style={[styles.upvoteButton]}
                        onPress={ async () => {
                            try {
                                if (upvoted) {
                                    const response = await downvotePost({ variables: { id: data.post.id } });
                                    if (response.data.downvotePost) {
                                        setUpvoted(false);
                                        setUpvoteCount(upvoteCount - 1);
                                    }
                                } else {
                                    const response = await upvotePost({ variables: { id: data.post.id } });
                                    if (response.data.upvotePost) {
                                        setUpvoted(true);
                                        setUpvoteCount(upvoteCount + 1);
                                    }
                                }
                            } catch (err) {
                                console.log(err);
                            }}
                        }>
                            <MIcon name='arrow-up-bold' size={28} color={upvoted ? '#6BB64a' : '#d8d8d8'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.replyButton]} onPress={() => setCommentBoxVisible(!commentBoxVisible)}>
                            <MatIcon name='add-comment' size={24} color='#434343' />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.replyButton, { disabled: generatedAnswerLoading }]} onPress={async () => {
                            try {
                                if (generatedAnswerLoading) return;
                                setGeneratedAnswerVisible(true);
                                setGeneratedAnswerLoading(true);
                                const response = await getGeminiResponseForPost({ variables: { postId: data.post.id } });
                                const text = response.data.getGeminiResponseForPost;
                                if (typeof text !== 'string') throw new Error('Invalid response from server');
                                setGeneratedAnswer(text);
                                setGeneratedAnswerLoading(false);
                            } catch (err) {
                                console.log(err);
                            }
                        }}>
                            <MatIcon name='lightbulb-outline' size={24} color={generatedAnswerVisible ? '#6BB64a' : '#434343'} />
                        </TouchableOpacity>
                    </View>
                    <View>
                      {generatedAnswerVisible && (
                        <View style={styles.generatedAnswerContainer}>
                            <ScrollView>
                            <Text style={styles.generatedAnswerContent}>{generatedAnswer}</Text>
                            </ScrollView>
                        </View>
                      )}
                    </View>
                    <View style={styles.repliesContainer}>
                    <FlatList
                        data={data.post.replies}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={RenderItem}
                    />
                    </View>
                    {commentBoxVisible && (
                        <View style={styles.newReplyContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder='Type a reply'
                                onChangeText={(val) => setTextInput(val)}
                                value={textInput}
                                multiline={true}
                                maxLength={1000}
                            />
                            <TouchableOpacity
                                style={styles.sendBtn}
                                onPress={async () => {
                                    if (textInput.length > 0) {
                                        try {
                                            const response = await replyPost({
                                                variables: {
                                                    content: textInput,
                                                    postId: data.post.id,
                                                }
                                            });
                                            console.log(response.data.replyPost);
                                            setTextInput('');
                                            setCommentBoxVisible(false);
                                            navigation.navigate('Post', { id: data.post.id });
                                        } catch (err) {
                                            console.log(err);
                                        }
                                    }
                                }}
                            >
                                <MatIcon name='send' size={30} color='#6BB64a' />
                            </TouchableOpacity>
                        </View>
                    )}
                    { userData.id === data.post.owner.id &&
                        <TouchableOpacity style={styles.deletePostButton} onPress={() => {
                            Alert.alert(
                                'Delete Post',
                                'Are you sure you want to delete this post?',
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    { text: 'Delete', onPress: deletePostHandler }
                                ]
                            );
                        }}>
                            <Text style={{ color: '#fff', fontSize: 17 }}>🗑</Text>
                        </TouchableOpacity>
                    }
                </View> 
            )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        // marginBottom: 10,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'justify',
        backgroundColor: '#4CBB17',
        paddingHorizontal: 10,
    },
    postsContainer: {
        flex: 1,
        borderRadius: 10,
        // justifyContent: 'center',
        alignItems: 'justify',
        backgroundColor: '#fff',
        paddingHorizontal: 5
    },
    itemContainer: {
        paddingTop: 5,
        // paddingBottom: 5,
    },
    itemContentContainer: {
        marginLeft: 5,
        paddingLeft: 15,
        paddingRight: 8,
        backgroundColor: '#eee',
        borderRadius: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 10,
    },
    projectTitle: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 5,
        color: '#222',
    },
    postTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    postContent: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10
    },
    postAuthor: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 0,
        marginTop: 15,
        marginLeft: 15,
    },
    postDate: {
        fontSize: 14,
        textAlign: 'left',
        marginBottom: 0,
        color: '#666',
        marginLeft: 15,
    },
    postUpvotes: {
        fontSize: 13,
        textAlign: 'left',
        color: '#666',
        // marginTop: 5,
    },
    votesContainer: {
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'center',
        // verticalAlign: 'top',
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 5,
    },

    upvoteButton: {
        // padding: 3,
        // margin: 10,
        borderRadius: 20,
        width: '14%',
        alignItems: 'left'
    },
    generatedAnswerContainer: {
        maxHeight: 200,
        backgroundColor: '#eee',
        marginBottom: 10,
        marginHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 13,
        paddingRight: 10,
        borderRadius: 10,
    },
    generatedAnswerContent: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10,
    },
    replyButton: {
        borderRadius: 20,
        width: '10%',
        alignItems: 'left',
        marginTop: 5,
    },
    repliesContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 5,
        // marginTop: 10,
        marginBottom: 15,
        borderRadius: 10,
    },
    replyUser: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 0,
        marginTop: 10,
        color: '#000',
    },
    replyMsg: {
        fontSize: 14,
        marginBottom: 10,
        marginTop: 0,
        color: '#111',
        fontWeight: 'semi-bold',
    },
    replyDatetime: {
        fontSize: 13,
        // marginBottom: 15,
        marginTop: 0,
        color: '#666',
    },
    newReplyContainer: {
        flexDirection: 'row',
        padding: 5,
        borderRadius: 20,
        marginTop: 10,
        marginLeft: 5,
    },
    textInput: {
        backgroundColor: '#eee',
        borderRadius: 20,
        padding: 10,
        marginBottom: 5,
        marginRight: 5,
        paddingLeft: 15,
        width: '80%',
    },
    sendBtn: {
        // backgroundColor: '#6BB64a',
        borderRadius: 50,
        paddingTop: 8,
        marginLeft: 10,
        color: '#4CBB17',
    },
    createPostButton: {
        backgroundColor: '#6BB64a',
        padding: 9,
        margin: 10,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    },
    deletePostButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: '#dd0000',
        borderRadius: 50,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default PostScreen;
