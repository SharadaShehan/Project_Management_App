import { PubSub } from 'graphql-subscriptions'
import { SESS_NAME, SESS_SECRET, SESS_LIFETIME, IN_PROD } from './config.js'
import session from 'express-session'

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

export { pubSub, sessionMiddleware }
