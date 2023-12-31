import { Project, User } from '../models/index.js'
import * as Auth from '../auth.js'
import { createProject } from '../schemas/index.js'

export default {
  Query: {
    projects: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const projects = await Project.find({ members: req.session.userId })
      return projects
    },
    project: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.find({ _id: id, members: req.session.userId })
      return project[0]
    }
  },
  Mutation: {
    createProject: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.owner = req.session.userId
      args.members = args.members || []
      if (!args.members.includes(req.session.userId)) {
        args.members.push(req.session.userId)
      }
      const idsFound = await User.where('_id').in(args.members).countDocuments()
      if (idsFound !== args.members.length) {
        throw new Error('One or more members do not exist')
      }
      await createProject.validateAsync(args, { abortEarly: false })
      const project = await Project.create(args)
      await User.updateMany({ _id: { $in: args.members } }, { $push: { projects: project.id } })
      return project
    }
  },
  Project: {
    owner: async (project, args, context, info) => {
      return (await project.populate('owner')).owner
    },
    members: async (project, args, context, info) => {
      return (await project.populate('members')).members
    },
    processes: async (project, args, context, info) => {
      return (await project.populate('processes')).processes
    },
    defaultProcess: async (project, args, context, info) => {
      return (await project.populate('defaultProcess')).defaultProcess
    }
  }
}
