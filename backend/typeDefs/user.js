import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        me: User
    }

    type User {
        username: String!
        firstName: String!
        lastName: String!
        gender: String
        country: String
        primaryEmail: String!
        secondaryEmail: String
        projects: [Project!]
    }
`
