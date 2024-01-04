import { Post, Reply } from '../models/forum.js'
import * as Auth from '../auth.js'
import { createPost, updatePost, createReply } from '../schemas/forum.js'
import { Project } from '../models/index.js'

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
    },
    updatePost: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const post = await Post.findById(args.id)
      delete args.id
      if (!post) throw new Error('Post not found')
      if (post.owner.toString() !== req.session.userId) throw new Error('Unauthorized')
      await updatePost.validateAsync(args)
      await Post.updateOne({ _id: post.id }, args)
      return await Post.findById(post.id)
    },
    deletePost: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const post = await Post.findById(args.id)
      if (!post) throw new Error('Post not found')
      if (post.owner.toString() !== req.session.userId) throw new Error('Unauthorized')
      await Post.deleteOne({ _id: post.id })
      return true
    },
    upvotePost: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const post = await Post.findById(args.id)
      const project = await Project.findById(post.project)
      if (!project.members.includes(req.session.userId)) throw new Error('Not a member of this project')
      if (!post) throw new Error('Post not found')
      if (post.upvotedUsers.includes(req.session.userId)) throw new Error('Already upvoted')
      await Post.updateOne({ _id: post.id }, { upvotes: post.upvotes + 1, $push: { upvotedUsers: req.session.userId } })
      return await Post.findById(post.id)
    },
    downvotePost: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const post = await Post.findById(args.id)
      const project = await Project.findById(post.project)
      if (!project.members.includes(req.session.userId)) throw new Error('Not a member of this project')
      if (!post) throw new Error('Post not found')
      if (!post.upvotedUsers.includes(req.session.userId)) throw new Error('Not upvoted')
      await Post.updateOne({ _id: post.id }, { upvotes: post.upvotes - 1, $pull: { upvotedUsers: req.session.userId } })
      return await Post.findById(post.id)
    },
    replyPost: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const post = await Post.findById(args.postId)
      if (!post) throw new Error('Post not found')
      delete args.postId
      const project = await Project.findById(post.project)
      if (!project) throw new Error('Project not found')
      if (!project.members.includes(req.session.userId)) throw new Error('Not a member of this project')
      args.post = post.id
      args.owner = req.session.userId
      args.upvotes = 0
      args.upvotedUsers = []
      await createReply.validateAsync(args)
      const reply = await Reply.create(args)
      await Post.updateOne({ _id: post.id }, { $push: { replies: reply.id } })
      return await Post.findById(post.id)
    },
    upvoteReply: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const reply = await Reply.findById(args.id)
      if (!reply) throw new Error('Reply not found')
      const post = await Post.findById(reply.post)
      if (!post) throw new Error('Post not found')
      const project = await Project.findById(post.project)
      if (!project) throw new Error('Project not found')
      if (!project.members.includes(req.session.userId)) throw new Error('Not a member of this project')
      if (reply.upvotedUsers.includes(req.session.userId)) throw new Error('Already upvoted')
      await Reply.updateOne({ _id: reply.id }, { upvotes: reply.upvotes + 1, $push: { upvotedUsers: req.session.userId } })
      return await Reply.findById(reply.id)
    },
    downvoteReply: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const reply = await Reply.findById(args.id)
      if (!reply) throw new Error('Reply not found')
      const post = await Post.findById(reply.post)
      if (!post) throw new Error('Post not found')
      const project = await Project.findById(post.project)
      if (!project) throw new Error('Project not found')
      if (!project.members.includes(req.session.userId)) throw new Error('Not a member of this project')
      if (!reply.upvotedUsers.includes(req.session.userId)) throw new Error('Not upvoted')
      await Reply.updateOne({ _id: reply.id }, { upvotes: reply.upvotes - 1, $pull: { upvotedUsers: req.session.userId } })
      return await Reply.findById(reply.id)
    },
    deleteReply: async (root, args, { req }, info) => {
      Auth.checkSignedIn(req)
      const reply = await Reply.findById(args.id)
      if (!reply) throw new Error('Reply not found')
      const post = await Post.findById(reply.post)
      if (!post) throw new Error('Post not found')
      if (reply.owner.toString() !== req.session.userId) throw new Error('Unauthorized')
      await Reply.deleteOne({ _id: reply.id })
      await Post.updateOne({ _id: post.id }, { $pull: { replies: reply.id } })
      return true
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
  },
  Reply: {
    post: async (reply, args, { req }, info) => {
      return (await reply.populate('post')).post
    },
    upvotedUsers: async (reply, args, { req }, info) => {
      return (await reply.populate('upvotedUsers')).upvotedUsers
    },
    owner: async (reply, args, { req }, info) => {
      return (await reply.populate('owner')).owner
    }
  }
}
