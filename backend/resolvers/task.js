import { Phase, Task } from '../models/index.js'
import * as Auth from '../auth.js'

export default {
  Query: {
    tasks: async (root, { phaseId }, { req }, info) => {
      Auth.checkSignedIn(req)
      const phase = await Phase.find({ _id: phaseId, phaseMembers: req.session.userId })
      if (!phase) {
        throw new Error('Phase not found')
      }
      const tasks = await Task.find({ phase: phaseId })
      return tasks
    },
    task: async (root, { id }, { req }, info) => {
      Auth.checkSignedIn(req)
      const task = await Task.find({ _id: id })
      if (!task) {
        throw new Error('Task not found')
      }
      const phase = await Phase.find({ _id: task.phase, phaseMembers: req.session.userId })
      if (!phase) {
        throw new Error('Unauthorized')
      }
      return task
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
