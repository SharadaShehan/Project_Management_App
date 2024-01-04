import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5000
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    default: Date.now
  },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }]
})

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5000
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Post = mongoose.model('Post', postSchema)
const Reply = mongoose.model('Reply', replySchema)

export { Post, Reply }
