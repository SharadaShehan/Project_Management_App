import { gql } from '@apollo/client';

const SIGNIN_MUTATION = gql`
    mutation signIn($username: String!, $password: String!) {
        signIn(username: $username, password: $password) {
            firstName
        }
    }
`;

const SIGNOUT_MUTATION = gql`
    mutation signOut {
        signOut
    }
`;

export { SIGNIN_MUTATION, SIGNOUT_MUTATION };
