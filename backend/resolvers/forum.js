import { Post, Reply } from '../models/forum.js'
import * as Auth from '../auth.js'
import { createPost, updatePost, createReply } from '../schemas/forum.js'
import { Project } from '../models/index.js'
import mongoose from 'mongoose'

export default {
  Query: {
    posts: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userId = req.session.userId
      const project = await Project.findById(args.projectId)
      if (!project) throw new Error('Project not found')
      if (!project.members.includes(userId)) throw new Error('Not a member of this project')
      const posts = await Post.find({ project: args.projectId })
      console.log(posts)
      return posts
    },
    post: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const userId = req.session.userId
      const post = await Post.findById(args.id)
      if (!post) throw new Error('Post not found')
      const project = await Project.findById(post.project)
      if (!project) throw new Error('Project not found')
      if (!project.members.includes(userId)) throw new Error('Not a member of this project')
      return post
    }
  },

  Mutation: {
    createPost: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      args.owner = req.session.userId
      args.project = args.projectId
      delete args.projectId
      const project = await Project.findById(args.project)
      if (!project) throw new Error('Project not found')
      if (!project.members.includes(args.owner)) throw new Error('Not a member of this project')
      args.upvotes = 0
      args.upvotedUsers = []
      args.replies = []
      console.log(args)
      await createPost.validateAsync(args)
      const post = await Post.create(args)
      return post
    }
  },

  Post: {
    project: async (post, args, { req }, info) => {
      return (await post.populate('project')).project
    },
    upvotedUsers: async (post, args, { req }, info) => {
      return (await post.populate('upvotedUsers')).upvotedUsers
    },
    owner: async (post, args, { req }, info) => {
      return (await post.populate('owner')).owner
    },
    replies: async (post, args, { req }, info) => {
      return (await post.populate('replies')).replies
    }
  },
  PostShortened: {
    project: async (post, args, { req }, info) => {
      return (await post.populate('project')).project
    },
    owner: async (post, args, { req }, info) => {
      return (await post.populate('owner')).owner
    }
  }
}
