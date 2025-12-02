import { gql } from '@apollo/client';

const NEW_PRIVATE_MESSAGE_SUBSCRIPTION = gql`
    subscription onNewPrivateMessage($wsToken: String!) {
        onNewPrivateMessage(wsToken: $wsToken) {
            id
            content
            sender {
                id
                username
                firstName
                lastName
                imageURL
            }
            receiver {
                id
                username
                firstName
                lastName
                imageURL
            }
            index
            createdAt
            read
        }
    }
`;

const NEW_PROJECT_MESSAGE_SUBSCRIPTION = gql`
    subscription onNewProjectMessage($wsToken: String!) {
        onNewProjectMessage(wsToken: $wsToken) {
            id
            content
            sender {
                id
                username
                firstName
                lastName
                imageURL
            }
            project {
                id
                title
                logo
            }
            index
            createdAt
            read
        }
    }
`;

const NEW_PHASE_MESSAGE_SUBSCRIPTION = gql`
    subscription onNewPhaseMessage($wsToken: String!) {
        onNewPhaseMessage(wsToken: $wsToken) {
            id
            content
            sender {
                id
                username
                firstName
                lastName
                imageURL
            }
            phase {
                id
                title
            }
            project {
                id
                title
                logo
            }
            index
            createdAt
            read
        }
    }
`;

export { NEW_PRIVATE_MESSAGE_SUBSCRIPTION, NEW_PROJECT_MESSAGE_SUBSCRIPTION, NEW_PHASE_MESSAGE_SUBSCRIPTION };

