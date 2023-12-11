import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        projects: [Project!]
        project(id: ID!): Project
    }

    extend type Mutation {
        createProject(title: String!, description: String, members: [ID!]): Project
    }

    type Project {
        id: ID!
        title: String!
        description: String
        owner: User!
        members: [User!]
        status: String!
        processes: [Process!]
        defaultProcess: Process
    }
`
