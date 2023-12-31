import { gql } from 'apollo-server-express'

export default gql`

    type Task {
        id: ID!
        phase: Phase!
        title: String!
        description: String
        deadline: String
        taskAssignees: [UserShortened!]
        status: String!
    }
`
