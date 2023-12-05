import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        me: String!
    }

    type User {
        email: String!
    }
`
