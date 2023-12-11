import { gql } from '@apollo/client';

const PROJECTS_QUERY = gql`
    query projects {
        projects {
            id
            title
            description
            status
        }
    }
`;

export { PROJECTS_QUERY };
