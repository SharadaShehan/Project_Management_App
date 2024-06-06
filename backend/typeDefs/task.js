import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        tasks(phaseId: ID!): [Task!]
        task(id: ID!): Task
    }

    extend type Mutation {
        createTask(phaseId: ID!, title: String!, description: String, endDate: String, endTime: String, timezoneOffset: Int): Task
        updateTask(id: ID!, title: String, description: String, endDate: String, endTime: String, status: String, timezoneOffset: Int): Task
        deleteTask(id: ID!): Boolean
        assignTask(id: ID!, assignees: [ID!]!): Task
        unassignTask(id: ID!, assignees: [ID!]!): Task
    }

    type Task {
        id: ID!
        phase: PhaseShortened!
        title: String!
        description: String
        endDate: String
        endTime: String
        timezoneOffset: Int
        taskAssignees: [UserShortened!]
        status: String!
    }
`
