import { User } from '../models/index.js'
import { signIn, signUp } from '../schemas/index.js'
import * as Auth from '../auth.js'
import crypto from 'crypto'
import AWS from '../awsConfig.js'
import { IMAGE_UPLOAD_S3_BUCKET_NAME, PUBLIC_READ_S3_BUCKET_NAME } from '../config.js'
import { v4 as uuidv4 } from 'uuid'

export default {
  Query: {
    me: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      return await User.findById(req.session.userId)
    },
    searchUser: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      return await User.find({
        $or: [
          { firstName: { $regex: args.searchText, $options: 'i' } },
          { lastName: { $regex: args.searchText, $options: 'i' } },
          { username: { $regex: args.searchText, $options: 'i' } }
        ]
      })
    }
  },
  Mutation: {
    signUp: async (root, args, { req }, info) => {
      Auth.checkSignedOut(req)
      await signUp.validateAsync(args, { abortEarly: false })
      // check if imageURL is present and replace the bucket name
      if (args.imageURL) {
        args.imageURL = args.imageURL.replace(IMAGE_UPLOAD_S3_BUCKET_NAME, PUBLIC_READ_S3_BUCKET_NAME)
      }
      const user = await User.create(args)
      req.session.userId = user.id
      const wsToken = crypto.randomBytes(16).toString('hex')
      await User.updateOne({ _id: user.id }, { wsToken })
      return User.findById(user.id)
    },
    signIn: async (root, args, { req }, info) => {
      Auth.checkSignedOut(req)
      await signIn.validateAsync(args, { abortEarly: false })
      const user = await Auth.attemptSignIn(args.username, args.password)
      req.session.userId = user.id
      const wsToken = crypto.randomBytes(16).toString('hex')
      await User.updateOne({ _id: user.id }, { wsToken })
      return User.findById(user.id)
    },
    signOut: async (root, args, { req, res }, info) => {
      Auth.checkSignedIn(req)
      await Auth.signOut(req, res)
      return true
    },
    getPresignedURL: async (root, args, { req }, info) => {
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        signatureVersion: 'v4'
      })
      const params = {
        Bucket: IMAGE_UPLOAD_S3_BUCKET_NAME,
        Key: `profilePics/${uuidv4()}.${args.filetype}`,
        Expires: 600
      }
      return s3.getSignedUrl('putObject', params)
    }
  },
  User: {
    projects: async (user, args, context, info) => {
      return (await user.populate('projects')).projects
    }
  }
}
