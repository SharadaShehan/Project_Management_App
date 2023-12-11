import { gql } from 'apollo-server-express'

export default gql`

    type Phase {
        id: ID!
        process: Process!
        title: String!
        description: String
        order: Int!
        startDatetime: String
        endDatetime: String
        phaseAdmins: [User!]
        phaseMembers: [User!]
        status: String!
        tasks: [Task!]
    }
`
