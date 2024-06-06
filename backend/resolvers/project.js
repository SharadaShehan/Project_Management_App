import { Project, User, Process, Phase, Task, Request } from '../models/index.js'
import * as Auth from '../auth.js'
import { createProject, updateProject, removeMember } from '../schemas/index.js'

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
      const idsFound = await User.where('_id').in(args.members).countDocuments()
      if (idsFound !== args.members.length) {
        throw new Error('One or more members do not exist')
      }
      const membersIds = args.members
      args.members = [req.session.userId]
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
      for (const member of membersIds) {
        if (member !== req.session.userId) {
          await Request.create({
            project: project.id,
            receiver: member,
            status: 'Pending'
          })
        }
      }
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
    },
    removeMember: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      await removeMember.validateAsync(args, { abortEarly: false })
      const project = await Project.findOne({ _id: args.projectId })
      if (!project) {
        throw new Error('Project not found')
      }
      if (project.owner.toString() !== req.session.userId) {
        throw new Error('Unauthorized')
      }
      if (project.owner.toString() === args.memberId) {
        throw new Error('Owner cannot be removed')
      }
      if (!project.members.includes(args.memberId)) {
        throw new Error('Member not found')
      }
      // Remove member from all processes, phases and tasks
      for (const process of project.processes) {
        const processObj = await Process.findOne({ _id: process })
        if (processObj.managers.includes(args.memberId)) {
          await processObj.updateOne({ $pull: { managers: args.memberId } })
          for (const phase of processObj.phases) {
            const phaseObj = await Phase.findOne({ _id: phase })
            if (phaseObj.phaseAdmins.includes(args.memberId)) {
              await phaseObj.updateOne({ $pull: { phaseAdmins: args.memberId } })
            }
            if (phaseObj.phaseMembers.includes(args.memberId)) {
              await phaseObj.updateOne({ $pull: { phaseMembers: args.memberId } })
            }
            for (const task of phaseObj.tasks) {
              const taskObj = await Task.findOne({ _id: task })
              if (taskObj.taskAssignees.includes(args.memberId)) {
                await taskObj.updateOne({ $pull: { taskAssignees: args.memberId } })
              }
            }
          }
        }
      }
      await project.updateOne({ $pull: { members: args.memberId } })
      await User.updateOne({ _id: args.memberId }, { $pull: { projects: args.projectId } })
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
