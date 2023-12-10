import { ApolloServer } from '@apollo/server'
import { createServer } from 'http'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import bodyParser from 'body-parser'
import express from 'express'
import session from 'express-session'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
// import { PubSub } from 'graphql-subscriptions'
import typeDefs from './typeDefs/index.js'
import resolvers from './resolvers/index.js'
import { APP_PORT, IN_PROD, DB_HOST, DB_PORT, DB_NAME, SESS_NAME, SESS_SECRET, SESS_LIFETIME } from './config.js'
import mongoose from 'mongoose'

const port = APP_PORT
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

await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log(err))

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()
app.use(session({
  name: SESS_NAME,
  secret: SESS_SECRET,
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(SESS_LIFETIME),
    sameSite: true,
    secure: IN_PROD
  }
}))

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

app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer, {
  context: ({ req, res }) => ({ req, res })
}))

httpServer.listen(port, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`)
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`)
})
