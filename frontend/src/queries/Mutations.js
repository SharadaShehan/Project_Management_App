import { gql } from '@apollo/client';

const SIGNIN_MUTATION = gql`
    mutation signIn($username: String!, $password: String!) {
        signIn(username: $username, password: $password) {
            id
            username
            firstName
            lastName
            wsToken
        }
    }
`;

const SIGNOUT_MUTATION = gql`
    mutation signOut {
        signOut
    }
`;

// Messages

const CREATE_PHASE_MESSAGE_MUTATION = gql`
    mutation createPhaseMessage($phaseId: ID!, $content: String!) {
        createPhaseMessage(phaseId: $phaseId, content: $content) {
            id
            content
            createdAt
            index
            read
            project {
                id
                title
            }
            phase {
                id
                title
            }
            sender {
                id
                firstName
                lastName
            }
        }
    }
`;

const CREATE_PROJECT_MESSAGE_MUTATION = gql`
    mutation createProjectMessage($projectId: ID!, $content: String!) {
        createProjectMessage(projectId: $projectId, content: $content) {
            id
            content
            createdAt
            index
            read
            project {
                id
                title
            }
            sender {
                id
                firstName
                lastName
            }
        }
    }
`;

const CREATE_PRIVATE_MESSAGE_MUTATION = gql`
    mutation createPrivateMessage($receiverId: ID!, $content: String!) {
        createPrivateMessage(receiverId: $receiverId, content: $content) {
            id
            content
            createdAt
            index
            read
            receiver {
                id
                firstName
                lastName
            }
            sender {
                id
                firstName
                lastName
            }
        }
    }
`;

// Forum

const CREATE_POST_MUTATION = gql`
    mutation createPost($projectId: ID!, $title: String!, $content: String!) {
        createPost(projectId: $projectId, title: $title, content: $content) {
            id
            project {
                id
                title
            }
            title
            content
            upvotes
            upvotedUsers {
                id
                firstName
                lastName
            }
            owner {
                id
                firstName
                lastName
            }
            createdAt
            replies {
                id
                content
                upvotes
                upvotedUsers {
                    id
                    firstName
                    lastName
                }
                owner {
                    id
                    firstName
                    lastName
                }
                createdAt
            }
        }
    }
`;

const UPVOTE_POST_MUTATION = gql`
    mutation upvotePost($id: ID!) {
        upvotePost(id: $id) {
            id
        }
    }
`;

const DOWNVOTE_POST_MUTATION = gql`
    mutation downvotePost($id: ID!) {
        downvotePost(id: $id) {
            id
        }
    }
`;

const UPVOTE_REPLY_MUTATION = gql`
    mutation upvoteReply($id: ID!) {
        upvoteReply(id: $id) {
            id
        }
    }
`;

const DOWNVOTE_REPLY_MUTATION = gql`
    mutation downvoteReply($id: ID!) {
        downvoteReply(id: $id) {
            id
        }
    }
`;

const REPLY_POST_MUTATION = gql`
    mutation replyPost($postId: ID!, $content: String!) {
        replyPost(postId: $postId, content: $content) {
            id
            replies {
                id
                content
                upvotes
                upvotedUsers {
                    id
                    firstName
                    lastName
                }
                owner {
                    id
                    firstName
                    lastName
                }
                createdAt
            }
        }
    }
`;

export { SIGNIN_MUTATION, SIGNOUT_MUTATION, CREATE_PHASE_MESSAGE_MUTATION, CREATE_PROJECT_MESSAGE_MUTATION, CREATE_PRIVATE_MESSAGE_MUTATION,
    CREATE_POST_MUTATION, UPVOTE_POST_MUTATION, DOWNVOTE_POST_MUTATION, UPVOTE_REPLY_MUTATION, DOWNVOTE_REPLY_MUTATION, REPLY_POST_MUTATION };
