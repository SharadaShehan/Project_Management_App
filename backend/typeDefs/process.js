import { gql } from 'apollo-server-express'

export default gql`

    type Process {
        id: ID!
        project: Project!
        title: String!
        description: String
        priority: String!
        managers: [User!]
        status: String!
        phases: [Phase!]
    }
`
