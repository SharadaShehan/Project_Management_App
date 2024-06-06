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
      const process = await Process.findOne({ _id: phase.process })
      if (!process) {
        throw new Error('Process not found')
      }
      if (!phase.phaseMembers.includes(req.session.userId) && !process.managers.includes(req.session.userId)) {
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
      const lastPhases = await Phase.find({ process: args.process }).sort({ order: -1 }).limit(1)
      const lastPhase = lastPhases[0]
      args.order = lastPhase ? lastPhase.order + 1 : 1
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
      await Phase.updateOne({ _id: phase.id }, { $pull: { phaseAdmins: { $in: args.members } } })
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
      const copiedMembers = [...args.admins]
      for (const admin of copiedAdmins) {
        if (!project.members.includes(admin)) {
          throw new Error('One or more admins are not members of the project')
        }
        if (phase.phaseAdmins.includes(admin)) {
          args.admins.splice(args.admins.indexOf(admin), 1)
        }
        if (phase.phaseMembers.includes(admin)) {
          copiedMembers.splice(copiedMembers.indexOf(admin), 1)
        }
      }
      await Phase.updateOne({ _id: phase.id }, { $push: { phaseAdmins: { $each: args.admins } } })
      await Phase.updateOne({ _id: phase.id }, { $push: { phaseMembers: { $each: copiedMembers } } })
      return Phase.findOne({ _id: phase.id })
    },
    removePhaseAdmins: async (root, args, { req }, info) => {
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
      delete args.id
      await adminsUpdate.validateAsync(args, { abortEarly: false })
      await Phase.updateOne({ _id: phase.id }, { $pull: { phaseAdmins: { $in: args.admins } } })
      return Phase.findOne({ _id: phase.id })
    },
    changePhaseOrder: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const process = await Process.findOne({ _id: args.processId })
      if (!process) {
        throw new Error('Process not found')
      }
      if (!process.managers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      const phases = await Phase.find({ process: args.processId, order: { $in: args.previousOrders } })
      if (phases.length !== args.previousOrders.length) {
        throw new Error('One or more phases not found')
      }
      const newPhases = await Phase.find({ process: args.processId, order: { $in: args.newOrders } })
      if (newPhases.length !== args.newOrders.length) {
        throw new Error('One or more phases not found')
      }
      const newOrders = [...args.newOrders]
      const previousOrders = [...args.previousOrders]
      if (!(previousOrders.every(element => Number.isInteger(element)) && newOrders.every(element => Number.isInteger(element)))) {
        throw new Error('Invalid format')
      }
      if (previousOrders.length !== newOrders.length) {
        throw new Error('Invalid format')
      }
      const sortedPreviousOrders = previousOrders.slice().sort()
      const sortedNewOrders = newOrders.slice().sort()
      if (!(sortedPreviousOrders.every((value, index) => value === sortedNewOrders[index]))) {
        throw new Error('Unmatched orders')
      }
      const uniqueValues = new Set(newOrders)
      if (uniqueValues.size !== newOrders.length) {
        throw new Error('Duplicate orders')
      }
      const currentOrderedPhases = phases.sort((a, b) => previousOrders.indexOf(a.order) - previousOrders.indexOf(b.order))
      currentOrderedPhases.forEach(async (phase, index) => {
        await Phase.updateOne({ _id: phase.id }, { order: newOrders[index] })
      })
      return await Phase.find({ process: args.processId }).sort({ order: 1 })
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
