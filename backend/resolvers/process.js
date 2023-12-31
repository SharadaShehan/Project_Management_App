import { Process, Project } from '../models/index.js'
import * as Auth from '../auth.js'

export default {
  Query: {
    processes: async (root, { projectId }, { req }, info) => {
      Auth.checkSignedIn(req)
      const project = await Project.find({ _id: projectId, members: req.session.userId })
      console.log(project)
      if (project.length === 0) {
        throw new Error('Unauthorized')
      }
      const processes = await Process.find({ project: projectId })
      console.log(processes)
      return processes
    },
    process: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.find({ _id: id })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.find({ _id: process.project, members: req.session.userId })
      if (!project) {
        throw new Error('Unauthorized')
      }
      return process[0]
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
  }
}
