import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        me: User
        hi: String
        searchUser(searchText: String!): [UserShortened!]!
    }

    extend type Mutation {
        signUp(username: String!, password: String!, firstName: String!, lastName: String!, gender: String, country: String, primaryEmail: String!, secondaryEmail: String): User
        signIn(username: String!, password: String!): User
        signOut: Boolean
    }

    type User {
        id: ID!
        username: String!
        firstName: String!
        lastName: String!
        gender: String
        country: String
        primaryEmail: String!
        secondaryEmail: String
        projects: [Project!]
        wsToken: String!
    }

    type UserShortened {
        id : ID!
        username: String!
        firstName: String!
        lastName: String!
        gender: String
    }
`
