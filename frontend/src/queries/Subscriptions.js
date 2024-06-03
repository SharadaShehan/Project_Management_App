import { gql } from '@apollo/client';

const NEW_MESSAGE_SUBSCRIPTION = gql`
    subscription newMessage($wsToken: String!) {
        newMessage(wsToken: $wsToken) {
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
            project {
                id
                title
                logo
            }
            phase {
                id
                title
            }
            index
            createdAt
            read
        }
    }
`;

export { NEW_MESSAGE_SUBSCRIPTION };
