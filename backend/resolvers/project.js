import { Project, User } from '../models/index.js'
import * as Auth from '../auth.js'
import { createProject } from '../schemas/index.js'

export default {
  Query: {
    projects: async (root, args, context, info) => {
      const projects = await Project.find({})
      return projects
    },
    project: async (root, { id }, context, info) => {
      const project = await Project.findById(id)
      return project
    }
  },
  Mutation: {
    createProject: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.owner = req.session.userId
      args.members = args.members || []
      args.members.push(req.session.userId)
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
    }
  }
}
