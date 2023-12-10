import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        project(id: ID!): Project
    }

    type Project {
        id: ID!
        title: String!
        description: String
        owner: User!
        members: [User!]
        status: String!
    }
`
