import { Project, User, Process, Phase, Task } from '../models/index.js'
import * as Auth from '../auth.js'
import { createProject, updateProject } from '../schemas/index.js'

export default {

  Query: {
    projects: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const projects = await Project.find({ members: req.session.userId })
      return projects
    },
    project: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: id })
      if (!project) {
        throw new Error('Project not found')
      }
      if (!project.members.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      return project
    }
  },

  Mutation: {
    createProject: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.owner = req.session.userId
      args.members = args.members || []
      args.processes = []
      args.status = 'Active'
      if (!args.members.includes(req.session.userId)) {
        args.members.push(req.session.userId)
      }
      const idsFound = await User.where('_id').in(args.members).countDocuments()
      if (idsFound !== args.members.length) {
        throw new Error('One or more members do not exist')
      }
      await createProject.validateAsync(args, { abortEarly: false })
      const project = await Project.create(args)
      const defaultProcess = await Process.create({
        title: 'Main Process',
        description: 'Default Process',
        priority: 'Normal',
        status: 'Active',
        project: project.id,
        managers: [],
        phases: []
      })
      project.defaultProcess = defaultProcess.id
      project.processes.push(defaultProcess.id)
      await project.save()
      await User.updateMany({ _id: { $in: args.members } }, { $push: { projects: project.id } })
      return project
    },
    updateProject: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: args.id })
      if (!project) {
        throw new Error('Project not found')
      }
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await updateProject.validateAsync(args, { abortEarly: false })
      await project.updateOne(args)
      return await Project.findOne({ _id: project.id })
    },
    deleteProject: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: id })
      if (!project) {
        throw new Error('Project not found')
      }
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      const processes = project.processes
      const phases = []
      for (const process of processes) {
        const processObj = await Process.findOne({ _id: process })
        phases.push(...processObj.phases)
      }
      const tasks = []
      for (const phase of phases) {
        const phaseObj = await Phase.findOne({ _id: phase })
        tasks.push(...phaseObj.tasks)
      }
      await User.updateMany({ projects: id }, { $pull: { projects: id } })
      await Process.deleteMany({ _id: { $in: processes } })
      await Phase.deleteMany({ _id: { $in: phases } })
      await Task.deleteMany({ _id: { $in: tasks } })
      await Project.deleteOne({ _id: id })
      return true
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
  },

  ProjectShortened: {
    defaultProcess: async (project, args, context, info) => {
      return (await project.populate('defaultProcess')).defaultProcess
    }
  }
}
