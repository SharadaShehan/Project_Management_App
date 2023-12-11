import { gql } from '@apollo/client';

const PROJECTS_QUERY = gql`
    query projects {
        projects {
            id
            title
            members {
                username
                firstName
                lastName
                primaryEmail
            }
        }
    }
`;

export { PROJECTS_QUERY };
