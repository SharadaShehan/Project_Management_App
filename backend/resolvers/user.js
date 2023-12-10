import { User } from '../models/index.js'
import { signIn, signUp } from '../schemas/index.js'
import * as Auth from '../auth.js'

export default {
  Query: {
    me: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      return await User.findById(req.session.userId)
    },
    hi: () => 'Hello World'
  },
  Mutation: {
    signUp: async (root, args, { req }, info) => {
      Auth.checkSignedOut(req)
      await signUp.validateAsync(args, { abortEarly: false })
      const user = await User.create(args)
      req.session.userId = user.id
      return user
    },
    signIn: async (root, args, { req }, info) => {
      Auth.checkSignedOut(req)
      await signIn.validateAsync(args, { abortEarly: false })
      const user = await Auth.attemptSignIn(args.username, args.password)
      req.session.userId = user.id
      return user
    },
    signOut: async (root, args, { req, res }, info) => {
      Auth.checkSignedIn(req)
      await Auth.signOut(req, res)
      return true
    }
  },
  User: {
    projects: async (user, args, context, info) => {
      return (await user.populate('projects')).projects
    }
  }
}
