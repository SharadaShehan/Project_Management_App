import Joi from 'joi'
import mongoose from 'mongoose'

const title = Joi.string().min(2).max(30).required().label('Title')
const description = Joi.string().min(5).max(100).label('Description')
const owner = Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
}).required().label('Owner')
const members = Joi.array().min(1).unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Members')
const status = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').label('Status')

export const createProject = Joi.object().keys({
  title,
  description,
  owner,
  members,
  status
})
