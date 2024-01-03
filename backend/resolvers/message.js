import { PrivateMessage } from '../models/index.js'
import * as Auth from '../auth.js'
import { createPrivateMessage } from '../schemas/message.js'
import mongoose from 'mongoose'
import { pubSub } from '../utils.js'

export default {
  Query: {
    lastPrivateMessages: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userIdObj = new mongoose.Types.ObjectId(req.session.userId)
      const lastMessagesOfUser = await PrivateMessage.aggregate([
        {
          $match: {
            $or: [
              { receiver: userIdObj },
              { sender: userIdObj }
            ]
          }
        },
        {
          $sort: {
            index: -1
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ['$receiver', userIdObj] },
                then: '$sender',
                else: '$receiver'
              }
            },
            lastMessage: {
              $first: '$$ROOT'
            }
          }
        },
        {
          $replaceRoot: {
            newRoot: '$lastMessage'
          }
        }
      ])
      const lastMessagesOfUserObjs = lastMessagesOfUser.map((message) => new PrivateMessage(message))
      return lastMessagesOfUserObjs
    },
    privateMessages: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userIdObj = new mongoose.Types.ObjectId(req.session.userId)
      const receiverIdObj = new mongoose.Types.ObjectId(args.userId)
      const lastMessageIndex = args.lastMessageIndex
      const limit = args.limit
      const messages = await PrivateMessage.aggregate([
        {
          $match: {
            $or: [
              { receiver: userIdObj, sender: receiverIdObj },
              { receiver: receiverIdObj, sender: userIdObj }
            ],
            index: { $lt: lastMessageIndex }
          }
        },
        {
          $sort: {
            index: -1
          }
        },
        {
          $limit: limit
        },
        {
          $sort: {
            index: 1
          }
        }
      ])
      const messagesObjs = messages.map((message) => new PrivateMessage(message))
      return messagesObjs
    }
  },

  Mutation: {
    createPrivateMessage: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.sender = req.session.userId
      args.receiver = args.receiverId
      delete args.receiverId
      const lastMessages = await PrivateMessage.find({
        $or: [
          { receiver: args.receiver, sender: args.sender },
          { receiver: args.sender, sender: args.receiver }
        ]
      }).sort({ index: -1 }).limit(1)
      const lastMessage = lastMessages[0]
      if (lastMessage) args.index = lastMessage.index + 1
      else args.index = 0
      await createPrivateMessage.validateAsync(args)
      const message = await PrivateMessage.create(args)
      pubSub.publish(args.receiver, { newMessage: message })
      return message
    }
  },

  Message: {
    __resolveType (message, context, info) {
      if (message.project) return 'ProjectMessage'
      if (message.phase) return 'PhaseMessage'
      return 'PrivateMessage'
    }
  },
  PrivateMessage: {
    sender: async (privateMessage, args, context, info) => {
      return (await privateMessage.populate('sender')).sender
    },
    receiver: async (privateMessage, args, context, info) => {
      return (await privateMessage.populate('receiver')).receiver
    }
  }
}
