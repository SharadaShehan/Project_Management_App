import Joi from 'joi'
import mongoose from 'mongoose'

const project = Joi.string().external(async (value) => {
  const project = await mongoose.model('Project').findById(value)
  if (!project) throw new Error('Invalid project')
}).required().label('Project')
const sender = Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
}).required().label('Sender')
const phase = Joi.string().external(async (value) => {
  const phase = await mongoose.model('Phase').findById(value)
  if (!phase) throw new Error('Invalid phase')
}).required().label('Phase')
const receiver = Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
}).required().label('Receiver')
const content = Joi.string().min(1).max(1000).required().label('Content')
const index = Joi.number().integer().min(0).required().label('Index')
const read = Joi.boolean().default(false).label('Read')

export const createPrivateMessage = Joi.object().keys({
  receiver,
  sender,
  content,
  index,
  read
})

export const createProjectMessage = Joi.object().keys({
  project,
  sender,
  content,
  index
})

export const createPhaseMessage = Joi.object().keys({
  project,
  phase,
  sender,
  content,
  index
})
