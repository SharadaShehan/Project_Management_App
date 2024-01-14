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

export { PROJECTS_QUERY, ONE_PROJECT_QUERY, PROCESS_QUERY };
