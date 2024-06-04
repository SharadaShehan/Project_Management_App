import { gql } from '@apollo/client';

const SIGNIN_MUTATION = gql`
    mutation signIn($username: String!, $password: String!) {
        signIn(username: $username, password: $password) {
            id
            username
            firstName
            lastName
            gender
            country
            primaryEmail
            secondaryEmail
            imageURL
            wsToken
        }
    }
`;

const SIGNOUT_MUTATION = gql`
    mutation signOut {
        signOut
    }
`;

const SIGNUP_MUTATION = gql`
    mutation signUp($username: String!, $password: String!, $firstName: String!, $lastName: String!, $gender: String, $country: String, $primaryEmail: String!, $secondaryEmail: String, $imageURL: String) {
        signUp(username: $username, password: $password, firstName: $firstName, lastName: $lastName, gender: $gender, country: $country, primaryEmail: $primaryEmail, secondaryEmail: $secondaryEmail, imageURL: $imageURL) {
            id
            username
            firstName
            lastName
            gender
            country
            primaryEmail
            secondaryEmail
            imageURL
            wsToken
        }
    }
`;

const SEARCH_USERS_MUTATION = gql`
    mutation searchUsers($searchText: String!) {
        searchUsers(searchText: $searchText) {
            id
            username
            firstName
            lastName
            imageURL
        }
    }
`;

const UPDATE_PROFILE_MUTATION = gql`
    mutation updateProfile($firstName: String!, $lastName: String!, $gender: String, $country: String, $primaryEmail: String!, $secondaryEmail: String, $imageURL: String) {
        updateProfile(firstName: $firstName, lastName: $lastName, gender: $gender, country: $country, primaryEmail: $primaryEmail, secondaryEmail: $secondaryEmail, imageURL: $imageURL) {
            id
            username
            firstName
            lastName
            gender
            country
            primaryEmail
            secondaryEmail
            imageURL
        }
    }
`;

const CHANGE_PASSWORD_MUTATION = gql`
    mutation changePassword($currentPassword: String!, $newPassword: String!) {
        changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
    }
`;

const GET_PRESIGNED_URL_MUTATION = gql`
    mutation getPresignedURL($filetype: String!) {
        getPresignedURL(filetype: $filetype)
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

const DELETE_POST_MUTATION = gql`
    mutation deletePost($id: ID!) {
        deletePost(id: $id)
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

// projects

const CREATE_PROJECT_MUTATION = gql`
    mutation createProject($title: String!, $description: String!, $members: [ID!], $logo: String) {
        createProject(title: $title, description: $description, members: $members, logo: $logo) {
            id
            defaultProcess {
                id
            }
        }
    }
`;


export { SIGNIN_MUTATION, SIGNOUT_MUTATION, SIGNUP_MUTATION, SEARCH_USERS_MUTATION, UPDATE_PROFILE_MUTATION, CHANGE_PASSWORD_MUTATION, GET_PRESIGNED_URL_MUTATION, CREATE_PHASE_MESSAGE_MUTATION, CREATE_PROJECT_MESSAGE_MUTATION, CREATE_PRIVATE_MESSAGE_MUTATION,
    CREATE_POST_MUTATION, DELETE_POST_MUTATION, UPVOTE_POST_MUTATION, DOWNVOTE_POST_MUTATION, UPVOTE_REPLY_MUTATION, DOWNVOTE_REPLY_MUTATION, REPLY_POST_MUTATION,
    CREATE_PROJECT_MUTATION};
