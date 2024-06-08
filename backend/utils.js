import { PubSub } from 'graphql-subscriptions'
import { GEMINI_API_KEY, REDIS_HOST } from './config.js'
import session from 'express-session'
import { GoogleGenerativeAI } from '@google/generative-ai'
import redis from 'redis'
import RedisStore from 'connect-redis'

const pubSub = new PubSub()

let redisClient
try {
  redisClient = redis.createClient({
    url: `redis://${REDIS_HOST}:6379`
  })
  if (!redisClient) throw new Error('Failed to connect to Redis')
  await redisClient.connect()
  console.log('Redis connected successfully')
} catch (err) {
  console.error(err)
}

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  name: 'apollo-session',
  secret: 'secret-key',
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    sameSite: true,
    secure: false
  }
})

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

export { pubSub, sessionMiddleware, geminiModel }
