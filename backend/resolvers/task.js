import { Phase, Task } from '../models/index.js'
import * as Auth from '../auth.js'
import { createTask, updateTask, taskAssignment } from '../schemas/task.js'

export default {
  Query: {
    tasks: async (root, { phaseId }, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: phaseId })
      if (!phase) {
        throw new Error('Phase not found')
      }
      if (!phase.phaseMembers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      const tasks = await Task.find({ phase: phaseId })
      return tasks
    },
    task: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const task = await Task.findOne({ _id: id })
      if (!task) {
        throw new Error('Task not found')
      }
      const phase = await Phase.findOne({ _id: task.phase })
      if (!phase) {
        throw new Error('Phase not found')
      }
      if (!phase.phaseMembers.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      return task
    }
  },

  Mutation: {
    createTask: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.findOne({ _id: args.phaseId })
      if (!phase) {
        throw new Error('Phase not found')
      }
      if (!phase.phaseAdmins.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      args.phase = args.phaseId
      delete args.phaseId
      args.description = args.description || ''
      args.endDate = args.endDate || ''
      args.endTime = args.endTime || ''
      args.timezoneOffset = args.timezoneOffset || 0
      args.status = 'Active'
      args.taskAssignees = []
      await createTask.validateAsync(args, { abortEarly: false })
      const task = await Task.create(args)
      await Phase.updateOne({ _id: task.phase }, { $push: { tasks: task._id } })
      return task
    },
    updateTask: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const task = await Task.findOne({ _id: args.id })
      if (!task) {
        throw new Error('Task not found')
      }
      const phase = await Phase.findOne({ _id: task.phase })
      if (!phase) {
        throw new Error('Phase not found')
      }
      if (!phase.phaseAdmins.includes(req.session.userId)) {
        throw new Error('Unauthorized')
      }
      delete args.id
      await updateTask.validateAsync(args, { abortEarly: false })
      await Task.updateOne({ _id: task.id }, args)
      return await Task.findOne({ _id: task.id })
    }
  },

  Task: {
    phase: async (task, args, context, info) => {
      return (await task.populate('phase')).phase
    },
    taskAssignees: async (task, args, context, info) => {
      return (await task.populate('taskAssignees')).taskAssignees
    }
  }
}
