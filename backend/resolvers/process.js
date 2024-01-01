import { Process, Project, Phase, Task } from '../models/index.js'
import * as Auth from '../auth.js'
import { createProcess, updateProcess, managersUpdate } from '../schemas/process.js'

export default {
  Query: {
    processes: async (root, { projectId }, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: projectId })
      if (!project) {
        throw new Error('Project not found')
      }
      if (!project.members.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      const processes = await Process.find({ project: projectId })
      return processes
    },
    process: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if (!project.members.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      return process
    }
  },

  Mutation: {
    createProcess: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.findOne({ _id: args.projectId })
      if (!project) {
        throw new Error('Project not found')
      }
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      args.project = args.projectId
      delete args.projectId
      args.description = args.description || ''
      args.status = 'Active'
      args.phases = []
      args.managers = args.managers || []
      await createProcess.validateAsync(args, { abortEarly: false })
      if (args.managers.length > 0) {
        for (const manager of args.managers) {
          if (!project.members.includes(manager)) {
            throw new Error('One or more managers are not members of the project')
          }
        }
      }
      const process = await Process.create(args)
      await Project.updateOne({ _id: args.project }, { $push: { processes: process.id } })
      return process
    },
    updateProcess: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: args.id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if ((project.owner.toString() !== req.session.userId) && (!process.managers.includes(req.session.userId))) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await updateProcess.validateAsync(args, { abortEarly: false })
      await Process.updateOne({ _id: process.id }, args)
      return Process.findOne({ _id: process.id })
    },
    deleteProcess: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      if (project.defaultProcess.toString() === id) {
        throw new Error('Cannot delete default process')
      }
      const phases = process.phases
      const tasks = []
      for (const phase of phases) {
        const phaseTasks = await Phase.findOne({ _id: phase })
        tasks.push(...phaseTasks.tasks)
      }
      await Task.deleteMany({ _id: { $in: tasks } })
      await Phase.deleteMany({ _id: { $in: phases } })
      await Process.deleteOne({ _id: id })
      await Project.updateOne({ _id: process.project }, { $pull: { processes: id } })
      return true
    },
    addProcessManagers: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: args.id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await managersUpdate.validateAsync(args, { abortEarly: false })
      for (const manager of args.managers) {
        if (!project.members.includes(manager)) {
          throw new Error('One or more managers are not members of the project')
        }
      }
      await Process.updateOne({ _id: process.id }, { $push: { managers: { $each: args.managers } } })
      return Process.findOne({ _id: process.id })
    },
    removeProcessManagers: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: args.id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await managersUpdate.validateAsync(args, { abortEarly: false })
      await Process.updateOne({ _id: process.id }, { $pull: { managers: { $in: args.managers } } })
      return Process.findOne({ _id: process.id })
    },
    changeDefaultProcess: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      await Project.updateOne({ _id: project.id }, { defaultProcess: id })
      return Process.findOne({ _id: id })
    }
  },

  Process: {
    project: async (process, args, context, info) => {
      return (await process.populate('project')).project
    },
    managers: async (process, args, context, info) => {
      return (await process.populate('managers')).managers
    },
    phases: async (process, args, context, info) => {
      return (await process.populate('phases')).phases
    }
  },

  ProcessShortened: {
    project: async (process, args, context, info) => {
      return (await process.populate('project')).project
    }
  }
}
