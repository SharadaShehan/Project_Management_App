import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        lastPrivateMessages: [PrivateMessage!]
        lastProjectMessages: [ProjectMessage!]
        lastPhaseMessages: [PhaseMessage!]
        privateMessages(userId: ID!, lastMessageIndex: Int!, limit: Int!): [PrivateMessage!]
        projectMessages(projectId: ID!, lastMessageIndex: Int!, limit: Int!): [ProjectMessage!]
        phaseMessages(phaseId: ID!, lastMessageIndex: Int!, limit: Int!): [PhaseMessage!]
    }

    extend type Mutation {
        createPrivateMessage(receiverId: ID!, content: String!): PrivateMessage
        createProjectMessage(projectId: ID!, content: String!): ProjectMessage
        createPhaseMessage(phaseId: ID!, content: String!): PhaseMessage
    }

    interface Message {
        id: ID!
        project: ProjectShortened
        phase: PhaseShortened
        sender: UserShortened!
        receiver: UserShortened
        content: String!
        index: Int!
        createdAt: String!
        read: Boolean
    }

    type PrivateMessage implements Message {
        id: ID!
        project: ProjectShortened
        phase: PhaseShortened
        sender: UserShortened!
        receiver: UserShortened!
        content: String!
        index: Int!
        createdAt: String!
        read: Boolean!
    }

    type ProjectMessage implements Message {
        id: ID!
        project: ProjectShortened!
        phase: PhaseShortened
        sender: UserShortened!
        receiver: UserShortened
        content: String!
        index: Int!
        createdAt: String!
        read: Boolean
    }

    type PhaseMessage implements Message {
        id: ID!
        project: ProjectShortened!
        phase: PhaseShortened!
        sender: UserShortened!
        receiver: UserShortened
        content: String!
        index: Int!
        createdAt: String!
        read: Boolean
    }
`
