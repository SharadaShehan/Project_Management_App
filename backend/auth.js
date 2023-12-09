import { AuthenticationError } from 'apollo-server-express'
import { User } from './models/index.js'
import { SESS_NAME } from './config.js'

export const attemptSignIn = async (username, password) => {
  const user = await User.findOne({ username })
  if (!user) {
    throw new AuthenticationError('Incorrect username or password. Please try again.')
  }
  if (!user.matchesPassword(password)) {
    throw new AuthenticationError('Incorrect username or password. Please try again.')
  }
  return user
}

export const checkSignedIn = req => {
  if (!req.session.userId) {
    throw new AuthenticationError('You must be signed in.')
  }
}

export const checkSignedOut = req => {
  if (req.session.userId) {
    throw new AuthenticationError('You are already signed in.')
  }
}

export const signOut = (req, res) => new Promise((resolve, reject) => {
  req.session.destroy(err => {
    if (err) reject(err)
    res.clearCookie(SESS_NAME)
    resolve(true)
  })
})
