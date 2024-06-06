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

const GET_GEMINI_RESPONSE_FOR_POST_MUTATION = gql`
    mutation getGeminiResponseForPost($postId: ID!) {
        getGeminiResponseForPost(postId: $postId)
}`;

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

const REMOVE_MEMBER_MUTATION = gql`
    mutation removeMember($projectId: ID!, $memberId: ID!) {
        removeMember(projectId: $projectId, memberId: $memberId)
    }
`;

const DELETE_PROJECT_MUTATION = gql`
    mutation deleteProject($id: ID!) {
        deleteProject(id: $id)
    }
`;

const CREATE_PROCESS_MUTATION = gql`
    mutation createProcess($projectId: ID!, $title: String!, $description: String!, $priority: String!, $managers: [ID!]) {
        createProcess(projectId: $projectId, title: $title, description: $description, priority: $priority, managers: $managers) {
            id
            project {
                id
            }
            title
            description
            status
            priority
            managers {
                id
                username
                firstName
                lastName
                imageURL
            }
            phases {
                id
                process {
                    id
                }
                title
                description
                order
                endDate
                endTime
                timezoneOffset
                status
                phaseMembers {
                    id
                }
            }
        }
    }
`;

const ADD_PROCESS_MANAGERS_MUTATION = gql`
    mutation addProcessManagers($id: ID!, $managers: [ID!]!) {
        addProcessManagers(id: $id, managers: $managers) {
            id
        }
    }
`;

const REMOVE_PROCESS_MANAGERS_MUTATION = gql`
    mutation removeProcessManagers($id: ID!, $managers: [ID!]!) {
        removeProcessManagers(id: $id, managers: $managers) {
            id
        }
    }
`;

const DELETE_PROCESS_MUTATION = gql`
    mutation deleteProcess($id: ID!) {
        deleteProcess(id: $id)
    }
`;

const CREATE_PHASE_MUTATION = gql`
    mutation createPhase($processId: ID!, $title: String!, $description: String, $startDate: String, $endDate: String, $endTime: String, $timezoneOffset: Int) {
        createPhase(processId: $processId, title: $title, description: $description, startDate: $startDate, endDate: $endDate, endTime: $endTime, timezoneOffset: $timezoneOffset) {
            id
            process {
                id
                title
            }
            title
            description
            order
            startDate
            endDate
            endTime
            timezoneOffset
            phaseAdmins {
                id
                username
                firstName
                lastName
                imageURL
            }
            phaseMembers {
                id
                username
                firstName
                lastName
                imageURL
            }
            status
            tasks {
                id
                phase {
                    id
                }
                title
                description
                endDate
                endTime
                timezoneOffset
                status
                taskAssignees {
                    id
                    username
                    firstName
                    lastName
                    imageURL
                }
            }
        }
    }
`;

const ADD_PHASE_MEMBERS_MUTATION = gql`
    mutation addPhaseMembers($id: ID!, $members: [ID!]!) {
        addPhaseMembers(id: $id, members: $members) {
            id
        }
    }
`;

const REMOVE_PHASE_MEMBERS_MUTATION = gql`
    mutation removePhaseMembers($id: ID!, $members: [ID!]!) {
        removePhaseMembers(id: $id, members: $members) {
            id
        }
    }
`;

const ADD_PHASE_ADMINS_MUTATION = gql`
    mutation addPhaseAdmins($id: ID!, $admins: [ID!]!) {
        addPhaseAdmins(id: $id, admins: $admins) {
            id
        }
    }
`;

const REMOVE_PHASE_ADMINS_MUTATION = gql`
    mutation removePhaseAdmins($id: ID!, $admins: [ID!]!) {
        removePhaseAdmins(id: $id, admins: $admins) {
            id
        }
    }
`;

const DELETE_PHASE_MUTATION = gql`
    mutation deletePhase($id: ID!) {
        deletePhase(id: $id)
    }
`;

const CREATE_TASK_MUTATION = gql`
    mutation createTask($phaseId: ID!, $title: String!, $description: String, $endDate: String, $endTime: String, $timezoneOffset: Int) {
        createTask(phaseId: $phaseId, title: $title, description: $description, endDate: $endDate, endTime: $endTime, timezoneOffset: $timezoneOffset) {
            id
            phase {
                id
            }
            title
            description
            endDate
            endTime
            timezoneOffset
            status
            taskAssignees {
                id
                username
                firstName
                lastName
                imageURL
            }
        }
    }
`;

const ASSIGN_TASK_MUTATION = gql`
    mutation assignTask($id: ID!, $assignees: [ID!]!) {
        assignTask(id: $id, assignees: $assignees) {
            id
        }
    }
`;

const UNASSIGN_TASK_MUTATION = gql`
    mutation unassignTask($id: ID!, $assignees: [ID!]!) {
        unassignTask(id: $id, assignees: $assignees) {
            id
        }
    }
`;

const DELETE_TASK_MUTATION = gql`
    mutation deleteTask($id: ID!) {
        deleteTask(id: $id)
    }
`;

// requests

const CREATE_REQUESTS_MUTATION = gql`
    mutation createRequests($projectId: ID!, $receiverIds: [ID!]!) {
        createRequests(projectId: $projectId, receiverIds: $receiverIds)
    }
`;

const RESPOND_REQUEST_MUTATION = gql`
    mutation respondRequest($id: ID!, $status: String!) {
        respondRequest(id: $id, status: $status) {
            id
            project {
                id
                title
                owner {
                    id
                    username
                    firstName
                    lastName
                    imageURL
                }
            }
            status
        }
    }
`;

const DELETE_REQUEST_MUTATION = gql`
    mutation deleteRequest($id: ID!) {
        deleteRequest(id: $id)
    }
`;

export { SIGNIN_MUTATION, SIGNOUT_MUTATION, SIGNUP_MUTATION, SEARCH_USERS_MUTATION, UPDATE_PROFILE_MUTATION, CHANGE_PASSWORD_MUTATION, GET_PRESIGNED_URL_MUTATION, CREATE_PHASE_MESSAGE_MUTATION, CREATE_PROJECT_MESSAGE_MUTATION, CREATE_PRIVATE_MESSAGE_MUTATION,
    CREATE_POST_MUTATION, DELETE_POST_MUTATION, UPVOTE_POST_MUTATION, DOWNVOTE_POST_MUTATION, UPVOTE_REPLY_MUTATION, DOWNVOTE_REPLY_MUTATION, REPLY_POST_MUTATION, GET_GEMINI_RESPONSE_FOR_POST_MUTATION,
    CREATE_PROJECT_MUTATION, REMOVE_MEMBER_MUTATION, DELETE_PROJECT_MUTATION,
    CREATE_PROCESS_MUTATION, ADD_PROCESS_MANAGERS_MUTATION, REMOVE_PROCESS_MANAGERS_MUTATION, DELETE_PROCESS_MUTATION,
    CREATE_PHASE_MUTATION, ADD_PHASE_MEMBERS_MUTATION, REMOVE_PHASE_MEMBERS_MUTATION, ADD_PHASE_ADMINS_MUTATION, REMOVE_PHASE_ADMINS_MUTATION, DELETE_PHASE_MUTATION,
    CREATE_TASK_MUTATION, ASSIGN_TASK_MUTATION, UNASSIGN_TASK_MUTATION, DELETE_TASK_MUTATION,
    CREATE_REQUESTS_MUTATION, RESPOND_REQUEST_MUTATION, DELETE_REQUEST_MUTATION };

