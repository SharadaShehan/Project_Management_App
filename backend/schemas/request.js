import Joi from 'joi'
import mongoose from 'mongoose'

const project = Joi.string().external(async (value) => {
  const project = await mongoose.model('Project').findById(value)
  if (!project) throw new Error('Invalid project')
}).required().label('Project')
const sender = Joi.string().external(async (value) => {
  const sender = await mongoose.model('User').findById(value)
  if (!sender) throw new Error('Invalid sender')
}).required().label('Sender')
const receiver = Joi.string().external(async (value) => {
  const receiver = await mongoose.model('User').findById(value)
  if (!receiver) throw new Error('Invalid receiver')
}).required().label('Receiver')
const status = Joi.string().valid('Pending', 'Accepted', 'Rejected').default('Pending').required().label('Status')

export const createRequest = Joi.object().keys({
  project,
  sender,
  receiver,
  status
})

export const respondRequest = Joi.object().keys({
  status
})
