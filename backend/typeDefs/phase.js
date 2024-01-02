import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        phases(processId: ID!): [PhaseShortened!]
        phase(id: ID!): Phase
    }

    extend type Mutation {
        createPhase(processId: ID!, title: String!, description: String, startDate: String, endDate: String, endTime: String, timezoneOffset: Int): Phase
        updatePhase(id: ID!, title: String, description: String, startDate: String, endDate: String, endTime: String, status: String, timezoneOffset: Int): Phase
        changePhaseOrder(processId: ID!, previousOrders: [Int!]!, newOrders: [Int!]!): [PhaseShortened!]
        deletePhase(id: ID!): Boolean
        addPhaseAdmins(id: ID!, admins: [ID!]!): Phase
        removePhaseAdmins(id: ID!, admins: [ID!]!): Phase
        addPhaseMembers(id: ID!, members: [ID!]!): Phase
        removePhaseMembers(id: ID!, members: [ID!]!): Phase
    }

    type Phase {
        id: ID!
        process: ProcessShortened!
        title: String!
        description: String
        order: Int!
        startDate: String!
        endDate: String
        endTime: String
        timezoneOffset: Int!
        phaseAdmins: [UserShortened!]
        phaseMembers: [UserShortened!]
        status: String!
        tasks: [Task!]
    }

    type PhaseShortened {
        id: ID!
        title: String!
        process: ProcessShortened!
        description: String
        order: Int!
        endDate: String
        endTime: String
        timezoneOffset: Int!
        status: String!
        phaseMembers: [UserShortened!]
    }
`
