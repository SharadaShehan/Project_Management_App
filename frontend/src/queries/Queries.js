import { gql } from '@apollo/client';

const PROJECTS_QUERY = gql`
    query projects {
        projects {
            id
            title
            description
            status
            defaultProcess {
                id
            }
        }
    }
`;

const ONE_PROJECT_QUERY = gql`
    query project($id: ID!) {
        project(id: $id) {
            id
            title
            description
            owner {
                id
            }
            members {
                id
                username
                firstName
                lastName
                gender
            }
            status
            processes {
                id
                title
            }
            defaultProcess {
                id
            }
        }
    }
`;

const PROCESS_QUERY = gql`
    query process($id: ID!) {
        process(id: $id) {
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
                gender
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

const LAST_PRIVATE_MESSAGES_QUERY = gql`
    query lastPrivateMessages {
        lastPrivateMessages {
            id
            sender {
                id
                firstName
                lastName
            }
            receiver {
                id
            }
            content
            createdAt
            read
            index
        }
    }
`;

const LAST_PROJECT_MESSAGES_QUERY = gql`
    query lastProjectMessages {
        lastProjectMessages {
            id
            sender {
                id
                firstName
                lastName
            }
            project {
                id
                title
            }
            content
            createdAt
            read
            index
        }
    }
`;

const LAST_PHASE_MESSAGES_QUERY = gql`
    query lastPhaseMessages {
        lastPhaseMessages {
            id
            sender {
                id
                firstName
                lastName
            }
            phase {
                id
                title
            }
            content
            createdAt
            read
            index
        }
    }
`;

const PRIVATE_MESSAGES_QUERY = gql`
    query privateMessages($userId: ID!, $lastMessageIndex: Int!, $limit: Int!) {
        privateMessages(userId: $userId, lastMessageIndex: $lastMessageIndex, limit: $limit) {
            id
            sender {
                id
            }
            receiver {
                id
            }
            content
            createdAt
            read
            index
        }
    }
`;

const PROJECT_MESSAGES_QUERY = gql`
    query projectMessages($projectId: ID!, $lastMessageIndex: Int!, $limit: Int!) {
        projectMessages(projectId: $projectId, lastMessageIndex: $lastMessageIndex, limit: $limit) {
            id
            sender {
                id
            }
            project {
                id
                firstName
                lastName
            }
            content
            createdAt
            read
            index
        }
    }
`;

const PHASE_MESSAGES_QUERY = gql`
    query phaseMessages($phaseId: ID!, $lastMessageIndex: Int!, $limit: Int!) {
        phaseMessages(phaseId: $phaseId, lastMessageIndex: $lastMessageIndex, limit: $limit) {
            id
            sender {
                id
                firstName
                lastName
            }
            phase {
                id
            }
            content
            createdAt
            read
            index
        }
    }
`;

export { PROJECTS_QUERY, ONE_PROJECT_QUERY, PROCESS_QUERY, LAST_PRIVATE_MESSAGES_QUERY, LAST_PROJECT_MESSAGES_QUERY, 
    LAST_PHASE_MESSAGES_QUERY, PRIVATE_MESSAGES_QUERY, PROJECT_MESSAGES_QUERY, PHASE_MESSAGES_QUERY };
