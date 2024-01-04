import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    sentRequests: [Request!]!
    receivedRequests: [Request!]!
  }

  extend type Mutation {
    createRequest(projectId: ID!, receiverId: ID!): Request!
    respondRequest(id: ID!, status: String!): Request!
    cancelRequest(id: ID!): Boolean!
  }

  type Request {
    id: ID!
    project: Project!
    sender: UserShortened!
    receiver: UserShortened!
    status: String!
  }
`
