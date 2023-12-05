import { ApolloServer } from '@apollo/server'
import { createServer } from 'http'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import bodyParser from 'body-parser'
import express from 'express'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
// import { PubSub } from 'graphql-subscriptions'
import typeDefs from './typeDefs/index.js'
import resolvers from './resolvers/index.js'

const port = 4000
// let counter = 0

// const typeDefs = `
//     type Query {
//         foo: String!
//     }
//     type Mutation {
//         scheduleOperation(name: String!): String!
//     }
//     type Subscription {
//         operationFinished: Operation!
//     }

//     type Operation {
//         name: String!
//         endDate: String!
//         value: Int!
//     }
// `

// const pubSub = new PubSub()

// const mockLongLastingOperation = (name) => {
//   setTimeout(() => {
//     counter++
//     pubSub.publish('OPERATION_FINISHED', { operationFinished: { name, endDate: new Date().toDateString(), value: counter } })
//   }, 1000)
// }

// const resolvers = {
//   Mutation: {
//     scheduleOperation (_, { name }) {
//       mockLongLastingOperation(name)
//       return `Operation: ${name} scheduled!`
//     }
//   },
//   Query: {
//     foo () {
//       return 'foo'
//     }
//   },
//   Subscription: {
//     operationFinished: {
//       subscribe: () => pubSub.asyncIterator(['OPERATION_FINISHED'])
//     }
//   }
// }

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
})

const wsServerCleanup = useServer({ schema }, wsServer)

const apolloServer = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart () {
        return {
          async drainServer () {
            await wsServerCleanup.dispose()
          }
        }
      }
    }
  ]
})

await apolloServer.start()

app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer))

httpServer.listen(port, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`)
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`)
})
