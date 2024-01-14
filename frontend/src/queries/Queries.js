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
                status
                priority
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
            title
            description
            status
            priority
            managers {
                id
            }
            phases {
                id
                title
                status
                endDatetime
            }
        }
    }
`;

export { PROJECTS_QUERY, ONE_PROJECT_QUERY, PROCESS_QUERY };
