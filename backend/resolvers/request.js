import { Project, Request } from '../models/index.js'
import * as Auth from '../auth.js'
import { createRequests, respondRequest, sentRequests } from '../schemas/request.js'

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
    createRequests: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: args.projectId })
      if (!project) throw new Error('Project not found')
      if (project.owner.toString() !== req.session.userId) throw new Error('Unauthorized')
      args.project = args.projectId
      delete args.projectId
      args.status = 'Pending'
      args.receivers = args.receiverIds
      delete args.receiverIds
      for (const receiver of args.receivers) {
        const pendingRequest = await Request.findOne({ project: args.project, receiver })
        if (pendingRequest) throw new Error('Request already sent for one or more Users')
        if (req.session.userId === receiver) throw new Error('Cannot send request to yourself')
        if (project.members.includes(receiver)) throw new Error('One or more Users already in project')
      }
      await createRequests.validateAsync(args, { abortEarly: false })
      for (const receiver of args.receivers) {
        await Request.create({ project: args.project, receiver, status: 'Pending' })
      }
      return true
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
