import { PubSub } from 'graphql-subscriptions'
import { SESS_NAME, SESS_SECRET, SESS_LIFETIME, IN_PROD, GEMINI_API_KEY } from './config.js'
import session from 'express-session'
import { GoogleGenerativeAI } from '@google/generative-ai'

const pubSub = new PubSub()

// const sessionMiddleware = session({
//   name: SESS_NAME,
//   secret: SESS_SECRET,
//   resave: true,
//   rolling: true,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: parseInt(SESS_LIFETIME),
//     sameSite: true,
//     secure: IN_PROD
//   }
// })

const sessionMiddleware = session({
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
})

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

export { pubSub, sessionMiddleware, geminiModel }
