import { gql } from 'apollo-server-express'

export default gql`

    type Task {
        id: ID!
        phase: PhaseShortened!
        title: String!
        description: String
        endDate: String
        endTime: String
        taskAssignees: [UserShortened!]
        status: String!
    }
`
