import { ApolloServer } from '@apollo/server'
import { createServer } from 'http'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import bodyParser from 'body-parser'
import express from 'express'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import typeDefs from './typeDefs/index.js'
import resolvers from './resolvers/index.js'
// import { APP_PORT, DB_STRING } from './config.js'
import { APP_PORT, DB_HOST, DB_PORT, DB_NAME } from './config.js'
import mongoose from 'mongoose'
// import { MongoClient, ObjectId } from 'mongodb'
import { pubSub, sessionMiddleware } from './utils.js'

const port = APP_PORT
const DB_STRING = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`

await mongoose.connect(DB_STRING)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log(err))

const app = express()
app.use(sessionMiddleware)
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
})

const schema = makeExecutableSchema({ typeDefs, resolvers })
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
  context: ({ req, res }) => ({ req, res, pubSub })
}))

httpServer.listen(port, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`)
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`)
})
