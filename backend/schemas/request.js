import Joi from 'joi'
import mongoose from 'mongoose'

const project = Joi.string().external(async (value) => {
  const project = await mongoose.model('Project').findById(value)
  if (!project) throw new Error('Invalid project')
}).required().label('Project')
const receivers = Joi.array().min(1).unique().items(Joi.string().external(async (value) => {
  const receiver = await mongoose.model('User').findById(value)
  if (!receiver) throw new Error('Invalid receiver')
})).label('Receivers')
const status = Joi.string().valid('Pending', 'Accepted', 'Rejected').default('Pending').required().label('Status')

export const sentRequests = Joi.object().keys({
  projectId: project
})

export const createRequests = Joi.object().keys({
  project,
  receivers,
  status
})

export const respondRequest = Joi.object().keys({
  status
})
