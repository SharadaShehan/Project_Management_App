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

export { SIGNIN_MUTATION, SIGNOUT_MUTATION };
