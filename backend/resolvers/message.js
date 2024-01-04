import { PrivateMessage, ProjectMessage, PhaseMessage, Project, Process, Phase } from '../models/index.js'
import * as Auth from '../auth.js'
import { createPrivateMessage, createProjectMessage, createPhaseMessage } from '../schemas/message.js'
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
            ],
            project: { $exists: false }
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
    lastProjectMessages: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userIdObj = new mongoose.Types.ObjectId(req.session.userId)
      const lastMessagesOfProject = await ProjectMessage.aggregate([
        {
          $match: {
            project: { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectObj'
          }
        },
        {
          $unwind: '$projectObj'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'projectObj.members',
            foreignField: '_id',
            as: 'members'
          }
        },
        {
          $match: {
            'members._id': userIdObj
          }
        },
        {
          $sort: {
            index: -1
          }
        },
        {
          $group: {
            _id: '$project',
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
      const lastMessagesOfProjectObjs = lastMessagesOfProject.map((message) => new ProjectMessage(message))
      return lastMessagesOfProjectObjs
    },
    lastPhaseMessages: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userIdObj = new mongoose.Types.ObjectId(req.session.userId)
      const lastMessagesOfPhase = await PhaseMessage.aggregate([
        {
          $match: {
            phase: { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'phases',
            localField: 'phase',
            foreignField: '_id',
            as: 'phaseObj'
          }
        },
        {
          $unwind: '$phaseObj'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'phaseObj.phaseMembers',
            foreignField: '_id',
            as: 'phaseMembers'
          }
        },
        {
          $match: {
            'phaseMembers._id': userIdObj
          }
        },
        {
          $sort: {
            index: -1
          }
        },
        {
          $group: {
            _id: '$phase',
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
      const lastMessagesOfPhaseObjs = lastMessagesOfPhase.map((message) => new PhaseMessage(message))
      return lastMessagesOfPhaseObjs
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
    },
    projectMessages: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userId = req.session.userId
      const projectIdObj = new mongoose.Types.ObjectId(args.projectId)
      const lastMessageIndex = args.lastMessageIndex
      const limit = args.limit
      const project = await Project.findById(projectIdObj)
      if (!project.members.includes(userId)) {
        throw new Error('Unauthorized')
      }
      const messages = await ProjectMessage.aggregate([
        {
          $match: {
            project: projectIdObj,
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
      const messagesObjs = messages.map((message) => new ProjectMessage(message))
      return messagesObjs
    },
    phaseMessages: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userId = req.session.userId
      const phaseIdObj = new mongoose.Types.ObjectId(args.phaseId)
      const lastMessageIndex = args.lastMessageIndex
      const limit = args.limit
      const phase = await Phase.findById(phaseIdObj)
      if (!phase.phaseMembers.includes(userId)) {
        throw new Error('Unauthorized')
      }
      const messages = await PhaseMessage.aggregate([
        {
          $match: {
            phase: phaseIdObj,
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
      const messagesObjs = messages.map((message) => new PhaseMessage(message))
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
    },
    createProjectMessage: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.sender = req.session.userId
      args.project = args.projectId
      delete args.projectId
      const project = await Project.findById(args.project)
      if (!project.members.includes(args.sender)) {
        throw new Error('Unauthorized')
      }
      const lastMessages = await ProjectMessage.find({
        project: args.project
      }).sort({ index: -1 }).limit(1)
      const lastMessage = lastMessages[0]
      if (lastMessage) args.index = lastMessage.index + 1
      else args.index = 0
      await createProjectMessage.validateAsync(args)
      const message = await ProjectMessage.create(args)
      const members = (await project.populate('members')).members
      members.forEach((member) => {
        pubSub.publish(member.id, { newMessage: message })
      })
      return message
    },
    createPhaseMessage: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.sender = req.session.userId
      args.phase = args.phaseId
      delete args.phaseId
      const phase = await Phase.findById(args.phase)
      const process = await Process.findById(phase.process)
      const project = await Project.findById(process.project)
      args.project = project.id
      if (!phase.phaseMembers.includes(args.sender)) {
        throw new Error('Unauthorized')
      }
      const lastMessages = await PhaseMessage.find({
        phase: args.phase
      }).sort({ index: -1 }).limit(1)
      const lastMessage = lastMessages[0]
      if (lastMessage) args.index = lastMessage.index + 1
      else args.index = 0
      await createPhaseMessage.validateAsync(args)
      const message = await PhaseMessage.create(args)
      const phaseMembers = (await phase.populate('phaseMembers')).phaseMembers
      phaseMembers.forEach((member) => {
        pubSub.publish(member.id, { newMessage: message })
      })
      return message
    }
  },

  Message: {
    __resolveType (message, context, info) {
      if (message.phase) return 'PhaseMessage'
      if (message.project) return 'ProjectMessage'
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
  },
  ProjectMessage: {
    project: async (projectMessage, args, context, info) => {
      return (await projectMessage.populate('project')).project
    },
    sender: async (projectMessage, args, context, info) => {
      return (await projectMessage.populate('sender')).sender
    }
  },
  PhaseMessage: {
    project: async (phaseMessage, args, context, info) => {
      return (await phaseMessage.populate('project')).project
    },
    phase: async (phaseMessage, args, context, info) => {
      return (await phaseMessage.populate('phase')).phase
    },
    sender: async (phaseMessage, args, context, info) => {
      return (await phaseMessage.populate('sender')).sender
    }
  }
}
