import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    sentRequests(projectId: ID!): [Request!]!
    receivedRequests: [Request!]!
  }

  extend type Mutation {
    createRequest(projectId: ID!, receiverId: ID!): Request!
    respondRequest(id: ID!, status: String!): Request!
    deleteRequest(id: ID!): Boolean!
  }

  type Request {
    id: ID!
    project: Project!
    receiver: UserShortened!
    status: String!
  }
`
