import { Project, Process, Phase } from '../models/index.js'
import * as Auth from '../auth.js'

export default {
  Query: {
    phases: async (root, { processId }, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.find({ _id: processId })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.find({ _id: process.project, members: req.session.userId })
      if (!project) {
        throw new Error('Unauthorized')
      }
      const phases = await Phase.find({ process: processId })
      return phases
    },
    phase: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.find({ _id: id, phaseMembers: req.session.userId })
      if (!phase) {
        throw new Error('Phase not found')
      }
      return phase[0]
    }
  },
  Phase: {
    process: async (phase, args, context, info) => {
      return (await phase.populate('process')).process
    },
    phaseAdmins: async (phase, args, context, info) => {
      return (await phase.populate('phaseAdmins')).phaseAdmins
    },
    phaseMembers: async (phase, args, context, info) => {
      return (await phase.populate('phaseMembers')).phaseMembers
    },
    tasks: async (phase, args, context, info) => {
      return (await phase.populate('tasks')).tasks
    }
  }
}
