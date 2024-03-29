import Joi from 'joi'
import mongoose from 'mongoose'

const title = Joi.string().min(2).max(30).required().label('Title')
const updateTitle = Joi.string().min(2).max(30).label('Title')
const description = Joi.string().min(5).max(300).required().label('Description')
const updateDescription = Joi.string().min(5).max(300).label('Description')
const owner = Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
}).required().label('Owner')
const members = Joi.array().min(1).unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Members')
const status = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').label('Status')
const updateStatus = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').label('Status')
const processes = Joi.array().unique().items(Joi.string().external(async (value) => {
  const process = await mongoose.model('Process').findById(value)
  if (!process) throw new Error('Invalid process')
})).label('Processes')
const defaultProcess = Joi.string().external(async (value) => {
  if (!value) return
  const process = await mongoose.model('Process').findById(value)
  if (!process) throw new Error('Invalid process')
}).label('Default process')

export const createProject = Joi.object().keys({
  title,
  description,
  owner,
  members,
  status,
  processes
})

export const updateProject = Joi.object().keys({
  title: updateTitle,
  description: updateDescription,
  status: updateStatus,
  defaultProcess
})
