import { gql } from 'apollo-server-express'

export default gql`

    type Phase {
        id: ID!
        process: ProcessShortened!
        title: String!
        description: String
        order: Int!
        startDate: String!
        endDate: String
        endTime: String
        phaseAdmins: [UserShortened!]
        phaseMembers: [UserShortened!]
        status: String!
        tasks: [Task!]
    }

    type PhaseShortened {
        id: ID!
        title: String!
        description: String
        order: Int!
        endDate: String
        endTime: String
        status: String!
    }
`
