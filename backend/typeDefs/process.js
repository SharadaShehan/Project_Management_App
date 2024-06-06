import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
        processes(projectId: ID!): [ProcessShortened!]
        process(id: ID!): Process
    }

    extend type Mutation {
        createProcess(projectId: ID!, title: String!, description: String!, priority: String!, managers: [ID!]): Process
        updateProcess(id: ID!, title: String, description: String, priority: String, status: String): Process
        deleteProcess(id: ID!): Boolean
        addProcessManagers(id: ID!, managers: [ID!]!): Process
        removeProcessManagers(id: ID!, managers: [ID!]!): Process
        changeDefaultProcess(id: ID!): Process
    }

    type Process {
        id: ID!
        project: ProjectShortened!
        title: String!
        description: String!
        priority: String!
        managers: [UserShortened!]
        status: String!
        phases: [PhaseShortened!]
    }

    type ProcessShortened {
        id: ID!
        project: ProjectShortened!
        title: String!
        description: String!
        priority: String!
        managers: [UserShortened!]
        status: String!
    }
`
