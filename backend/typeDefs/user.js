import { gql } from 'apollo-server-express'

export default gql`
    scalar Upload

    extend type Query {
        me: User
        searchUser(searchText: String!): [UserShortened!]!
    }

    extend type Mutation {
        signUp(username: String!, password: String!, firstName: String!, lastName: String!, gender: String, country: String, primaryEmail: String!, secondaryEmail: String, imageURL: String): User
        signIn(username: String!, password: String!): User
        signOut: Boolean
        updateProfile(firstName: String!, lastName: String!, gender: String, country: String, primaryEmail: String!, secondaryEmail: String, imageURL: String): User
        changePassword(currentPassword: String!, newPassword: String!): Boolean
        getPresignedURL(filetype: String!): String
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
        imageURL: String
    }

    type UserShortened {
        id: ID!
        username: String!
        firstName: String!
        lastName: String!
        gender: String
        imageURL: String
    }
`
