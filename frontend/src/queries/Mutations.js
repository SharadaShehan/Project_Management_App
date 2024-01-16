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

export { SIGNIN_MUTATION, SIGNOUT_MUTATION, CREATE_PHASE_MESSAGE_MUTATION };
