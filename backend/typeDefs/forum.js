import { gql } from 'apollo-server-express'

export default gql`
    extend type Query {
      posts(projectId: ID!): [PostShortened!]!
      post(id: ID!): Post!
    }

    extend type Mutation {
      createPost(projectId: ID!, title: String!, content: String!): Post!
      updatePost(id: ID!, title: String, content: String): Post!
      deletePost(id: ID!): Boolean!
      upvotePost(id: ID!): Post!
      downvotePost(id: ID!): Post!
      replyPost(postId: ID!, content: String!): Post!
      upvoteReply(id: ID!): Post!
      downvoteReply(id: ID!): Post!
      deleteReply(id: ID!): Post!
    }

    type Post {
      id: ID!
      project: Project!
      title: String!
      content: String!
      upvotes: Int!
      upvotedUsers: [UserShortened!]
      owner: UserShortened!
      createdAt: String!
      replies: [Reply]
    }

    type Reply {
      id: ID!
      post: Post!
      content: String!
      upvotes: Int!
      upvotedUsers: [UserShortened!]
      owner: UserShortened!
      createdAt: String!
    }

    type PostShortened {
      id: ID!
      title: String!
      content: String!
      project: Project!
      upvotes: Int!
      owner: UserShortened!
      createdAt: String!
    }
`
