import Joi from 'joi'
import mongoose from 'mongoose'

const title = Joi.string().min(2).max(30).required().label('Title')
const description = Joi.string().min(5).max(100).label('Description')
const project = Joi.string().external(async (value) => {
  const project = await mongoose.model('Project').findById(value)
  if (!project) throw new Error('Invalid project')
}).required().label('Project')
const priority = Joi.string().valid('Low', 'Normal', 'High').default('Normal').label('Priority')
const managers = Joi.array().unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Managers')
const status = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').label('Status')
const phases = Joi.array().unique().items(Joi.string().external(async (value) => {
  const phase = await mongoose.model('Phase').findById(value)
  if (!phase) throw new Error('Invalid phase')
})).label('Phases')

export const createProcess = Joi.object().keys({
  title,
  description,
  project,
  priority,
  managers,
  status,
  phases
})
