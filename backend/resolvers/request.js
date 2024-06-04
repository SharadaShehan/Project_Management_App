import { Project, Request } from '../models/index.js'
import * as Auth from '../auth.js'
import { createRequest, respondRequest, sentRequests } from '../schemas/request.js'

export default {
  Query: {
    sentRequests: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      await sentRequests.validateAsync(args, { abortEarly: false })
      const requests = await Request.find({ project: args.projectId })
      return requests
    },
    receivedRequests: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const requests = await Request.find({ receiver: req.session.userId })
      return requests
    }
  },

  Mutation: {
    createRequest: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: args.projectId })
      if (!project) throw new Error('Project not found')
      if (project.owner.toString() !== req.session.userId) throw new Error('Unauthorized')
      args.project = args.projectId
      delete args.projectId
      args.status = 'Pending'
      args.receiver = args.receiverId
      delete args.receiverId
      const pendingRequest = await Request.findOne({ project: args.project, receiver: args.receiver })
      if (pendingRequest) throw new Error('Request already sent')
      if (req.session.userId === args.receiver) throw new Error('Cannot send request to yourself')
      if (project.members.includes(args.receiver)) throw new Error('User already in project')
      await createRequest.validateAsync(args, { abortEarly: false })
      const request = await Request.create(args)
      return request
    },
    respondRequest: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const request = await Request.findOne({ _id: args.id })
      if (!request) throw new Error('Request not found')
      const project = await Project.findOne({ _id: request.project })
      if (!project) throw new Error('Project not found')
      if (request.receiver.toString() !== req.session.userId) throw new Error('Unauthorized')
      if (project.members.includes(request.receiver)) throw new Error('You are already in this project')
      if (request.status === 'Accepted') throw new Error('Request already responded')
      args.status = args.status || 'Pending'
      delete args.id
      await respondRequest.validateAsync(args, { abortEarly: false })
      await Request.updateOne({ _id: request.id }, args)
      const updatedRequest = await Request.findOne({ _id: request.id })
      if (updatedRequest.status === 'Accepted') {
        await Project.updateOne({ _id: updatedRequest.project }, { $push: { members: updatedRequest.receiver } })
      }
      return updatedRequest
    },
    deleteRequest: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const request = await Request.findOne({ _id: args.id })
      if (!request) throw new Error('Request not found')
      if (request.receiver.toString() !== req.session.userId) throw new Error('Unauthorized')
      await Request.deleteOne({ _id: args.id })
      return true
    }
  },

  Request: {
    project: async (request, args, { req }, info) => {
      return (await request.populate('project')).project
    },
    receiver: async (request, args, { req }, info) => {
      return (await request.populate('receiver')).receiver
    }
  }
}
