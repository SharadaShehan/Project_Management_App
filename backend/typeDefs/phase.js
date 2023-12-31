import { gql } from 'apollo-server-express'

export default gql`

    type Phase {
        id: ID!
        process: ProcessShortened!
        title: String!
        description: String
        order: Int!
        startDate:
        startTime: 
        endDate:
        endTime: 
        phaseAdmins: [UserShortened!]
        phaseMembers: [UserShortened!]
        status: String!
        tasks: [Task!]
    }

`
