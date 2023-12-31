import Joi from 'joi'
import mongoose from 'mongoose'

const title = Joi.string().min(1).max(100).required().label('Title')
const titleOptional = Joi.string().min(1).max(100).label('Title')
const content = Joi.string().min(1).max(5000).required().label('Content')
const contentOptional = Joi.string().min(1).max(5000).label('Content')
const post = Joi.string().external(async (value) => {
  const post = await mongoose.model('Post').findById(value)
  if (!post) throw new Error('Invalid post')
}).required().label('Post')
const project = Joi.string().external(async (value) => {
  const project = await mongoose.model('Project').findById(value)
  if (!project) throw new Error('Invalid project')
}).required().label('Project')
const owner = Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
}).required().label('Owner')
const upvotes = Joi.number().integer().min(0).default(0).label('Upvotes')
const upvotedUsers = Joi.array().unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Upvoted users')
const replies = Joi.array().unique().items(Joi.string().external(async (value) => {
  const reply = await mongoose.model('Reply').findById(value)
  if (!reply) throw new Error('Invalid reply')
})).label('Replies')

export const createPost = Joi.object().keys({
  title,
  content,
  project,
  owner,
  upvotes,
  upvotedUsers,
  replies
})

export const updatePost = Joi.object().keys({
  title: titleOptional,
  content: contentOptional
})

export const createReply = Joi.object().keys({
  post,
  content,
  owner,
  upvotes,
  upvotedUsers
})
