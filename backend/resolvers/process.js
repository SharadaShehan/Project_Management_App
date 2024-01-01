import { Process, Project } from '../models/index.js'
import * as Auth from '../auth.js'

export default {
  Query: {
    processes: async (root, { projectId }, { req }, info) => {
      Auth.checkSignedIn(req)
      console.log(projectId)
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
