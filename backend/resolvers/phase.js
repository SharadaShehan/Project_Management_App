import { Project, Process, Phase, Task } from '../models/index.js'
import * as Auth from '../auth.js'
import { createPhase, updatePhase, membersUpdate, adminsUpdate } from '../schemas/phase.js'

export default {
  Query: {
    phases: async (root, { processId }, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: processId })
      if (!process) {
        throw new Error('Process not found')
      }
      const project = await Project.findOne({ _id: process.project })
      if (!project) {
        throw new Error('Project not found')
      }
      if (!project.members.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      const phases = await Phase.find({ process: processId })
      return phases
    },
    phase: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: id })
      if (!phase) {
        throw new Error('Phase not found')
      }
      if (!phase.phaseMembers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      return phase
    }
  },

  Mutation: {
    createPhase: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: args.processId })
      if (!process) {
        throw new Error('Process not found')
      }
      if (!process.managers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      args.process = args.processId
      delete args.processId
      args.description = args.description || ''
      const lastPhases = await Phase.find({ process: args.process }).sort({ order: -1 }).limit(1)
      const lastPhase = lastPhases[0]
      args.order = lastPhase ? lastPhase.order + 1 : 1
      if (!args.startDate) {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
        const day = ('0' + currentDate.getDate()).slice(-2)
        const formattedDate = `${year}-${month}-${day}`
        args.startDate = formattedDate
      }
      args.endDate = args.endDate || ''
      args.endTime = args.endTime || ''
      args.timezoneOffset = args.timezoneOffset || 0
      args.status = 'Active'
      args.phaseAdmins = []
      args.phaseMembers = []
      args.tasks = []
      await createPhase.validateAsync(args, { abortEarly: false })
      const phase = await Phase.create(args)
      await Process.updateOne({ _id: args.process }, { $push: { phases: phase.id } })
      return phase
    },
    updatePhase: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: args.id })
      if (!phase) {
        throw new Error('Phase not found')
      }
      const process = await Process.findOne({ _id: phase.process })
      if (!process) {
        throw new Error('Process not found')
      }
      if (!phase.phaseAdmins.includes(req.session.userId) && !process.managers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await updatePhase.validateAsync(args, { abortEarly: false })
      await Phase.updateOne({ _id: phase.id }, args)
      return await Phase.findOne({ _id: phase.id })
    },
    deletePhase: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: id })
      if (!phase) {
        throw new Error('Phase not found')
      }
      const process = await Process.findOne({ _id: phase.process })
      if (!process) {
        throw new Error('Process not found')
      }
      if (!process.managers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      const order = phase.order
      const tasks = phase.tasks
      await Phase.deleteOne({ _id: id })
      await Task.deleteMany({ _id: { $in: tasks } })
      await Process.updateOne({ _id: process.id }, { $pull: { phases: id } })
      const phases = await Phase.find({ process: process.id, order: { $gt: order } })
      for (const phase of phases) {
        await Phase.updateOne({ _id: phase.id }, { order: phase.order - 1 })
      }
      return true
    },
    addPhaseMembers: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: args.id })
      if (!phase) {
        throw new Error('Phase not found')
      }
      const process = await Process.findOne({ _id: phase.process })
      if (!process) {
        throw new Error('Process not found')
      }
      if ((!process.managers.includes(req.session.userId)) && (!phase.phaseAdmins.includes(req.session.userId))) {
        throw new Error('Unauthorized')
      }
      const project = await Project.findOne({ _id: process.project })
      if (!project) {
        throw new Error('Project not found')
      }
      delete args.id
      await membersUpdate.validateAsync(args, { abortEarly: false })
      const copiedMembers = [...args.members]
      for (const member of copiedMembers) {
        if (!project.members.includes(member)) {
          throw new Error('One or more members are not members of the project')
        }
        if (phase.phaseMembers.includes(member)) {
          args.members.splice(args.members.indexOf(member), 1)
        }
      }
      await Phase.updateOne({ _id: phase.id }, { $push: { phaseMembers: { $each: args.members } } })
      return Phase.findOne({ _id: phase.id })
    },
    removePhaseMembers: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: args.id })
      if (!phase) {
        throw new Error('Phase not found')
      }
      const process = await Process.findOne({ _id: phase.process })
      if (!process) {
        throw new Error('Process not found')
      }
      if ((!process.managers.includes(req.session.userId)) && (!phase.phaseAdmins.includes(req.session.userId))) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await membersUpdate.validateAsync(args, { abortEarly: false })
      await Phase.updateOne({ _id: phase.id }, { $pull: { phaseMembers: { $in: args.members } } })
      return Phase.findOne({ _id: phase.id })
    },
    addPhaseAdmins: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: args.id })
      if (!phase) {
        throw new Error('Phase not found')
      }
      const process = await Process.findOne({ _id: phase.process })
      if (!process) {
        throw new Error('Process not found')
      }
      if (!process.managers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      const project = await Project.findOne({ _id: process.project })
      if (!project) {
        throw new Error('Project not found')
      }
      delete args.id
      await adminsUpdate.validateAsync(args, { abortEarly: false })
      const copiedAdmins = [...args.admins]
      for (const admin of copiedAdmins) {
        if (!project.members.includes(admin)) {
          throw new Error('One or more admins are not members of the project')
        }
        if (phase.phaseAdmins.includes(admin)) {
          args.admins.splice(args.admins.indexOf(admin), 1)
        }
      }
      await Phase.updateOne({ _id: phase.id }, { $push: { phaseAdmins: { $each: args.admins } } })
      return Phase.findOne({ _id: phase.id })
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
  },

  PhaseShortened: {
    process: async (phase, args, context, info) => {
      return (await phase.populate('process')).process
    },
    phaseMembers: async (phase, args, context, info) => {
      return (await phase.populate('phaseMembers')).phaseMembers
    }
  }
}
