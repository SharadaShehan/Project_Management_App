import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        lastPrivateMessages: [PrivateMessage!]
        lastProjectMessages: [ProjectMessage!]
        lastPhaseMessages: [PhaseMessage!]
        privateMessages(userId: ID!, lastMessageIndex: Int!, limit: Int!): [PrivateMessage!]
        projectMessages(projectId: ID!): [ProjectMessage!]
        phaseMessages(phaseId: ID!): [PhaseMessage!]
    }

    extend type Mutation {
        createPrivateMessage(receiverId: ID!, content: String!): PrivateMessage
        createProjectMessage(projectId: ID!, content: String!): ProjectMessage
        createPhaseMessage(phaseId: ID!, content: String!): PhaseMessage
    }

    type PrivateMessage {
        id: ID!
        sender: UserShortened!
        receiver: UserShortened!
        content: String!
        index: Int!
        createdAt: String!
        read: Boolean!
    }

    type ProjectMessage {
        id: ID!
        project: ProjectShortened!
        sender: UserShortened!
        content: String!
        index: Int!
        createdAt: String!
    }

    type PhaseMessage {
        id: ID!
        phase: PhaseShortened!
        sender: UserShortened!
        content: String!
        index: Int!
        createdAt: String!
    }
`
