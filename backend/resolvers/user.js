import { User } from '../models/index.js'
import { signIn, signUp, updateProfile, changePassword } from '../schemas/index.js'
import * as Auth from '../auth.js'
import crypto from 'crypto'
import AWS from '../awsConfig.js'
import { IMAGE_UPLOAD_S3_BUCKET_NAME, PUBLIC_READ_S3_BUCKET_NAME } from '../config.js'
import { v4 as uuidv4 } from 'uuid'
import hash from 'bcryptjs'

export default {
  Query: {
    me: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      return await User.findById(req.session.userId)
    }
  },
  Mutation: {
    signUp: async (root, args, { req }, info) => {
      Auth.checkSignedOut(req)
      await signUp.validateAsync(args, { abortEarly: false })
      // check if imageURL is present and replace the bucket name
      if (args.imageURL) {
        args.imageURL = args.imageURL.replace(IMAGE_UPLOAD_S3_BUCKET_NAME, PUBLIC_READ_S3_BUCKET_NAME)
        // check if '?' is present in the URL. If it is, remove everything after it
        const questionMarkIndex = args.imageURL.indexOf('?')
        if (questionMarkIndex !== -1) {
          args.imageURL = args.imageURL.substring(0, questionMarkIndex)
        }
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
    searchUsers: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      return await User.find({
        $or: [
          { firstName: { $regex: args.searchText, $options: 'i' } },
          { lastName: { $regex: args.searchText, $options: 'i' } },
          { username: { $regex: args.searchText, $options: 'i' } }
        ]
      })
    },
    updateProfile: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      await updateProfile.validateAsync(args, { abortEarly: false })
      // check if imageURL is present and replace the bucket name
      if (args.imageURL) {
        // check if imageURL contains the image upload bucket name
        if (args.imageURL.includes(IMAGE_UPLOAD_S3_BUCKET_NAME)) {
          args.imageURL = args.imageURL.replace(IMAGE_UPLOAD_S3_BUCKET_NAME, PUBLIC_READ_S3_BUCKET_NAME)
          // check if '?' is present in the URL. If it is, remove everything after it
          const questionMarkIndex = args.imageURL.indexOf('?')
          if (questionMarkIndex !== -1) {
            args.imageURL = args.imageURL.substring(0, questionMarkIndex)
          }
        }
      }
      await User.updateOne({ _id: req.session.userId }, args)
      return User.findById(req.session.userId)
    },
    changePassword: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const user = await User.findById(req.session.userId)
      if (!user) {
        throw new Error('User not found')
      }
      await changePassword.validateAsync(args, { abortEarly: false })
      await Auth.checkPassword(user, args.currentPassword)
      const newPassword = await hash.hash(args.newPassword, 10)
      await User.updateOne({ _id: req.session.userId }, { password: newPassword })
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
