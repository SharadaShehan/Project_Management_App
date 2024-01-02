import Joi from 'joi'
import mongoose from 'mongoose'

const datePattern = /^\d{4}-\d{2}-\d{2}$|^$/
const timePattern = /^\d{2}:\d{2}$|^$/

const title = Joi.string().min(2).max(30).required().label('Title')
const titleOptional = Joi.string().min(2).max(30).label('Title')
const description = Joi.string().min(5).max(100).label('Description')
const phase = Joi.string().external(async (value) => {
  const phase = await mongoose.model('Phase').findById(value)
  if (!phase) throw new Error('Invalid phase')
}).required().label('Phase')
const endDate = Joi.string().min(0).regex(datePattern).label('End date')
const endTime = Joi.string().min(0).regex(timePattern).label('End time')
const timezoneOffset = Joi.number().integer().min(-720).max(840).default(0).label('Timezone offset')
const taskAssignees = Joi.array().unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Task assignees')
const status = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').required().label('Status')
const statusOptional = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').label('Status')

export const createTask = Joi.object().keys({
  title,
  description,
  phase,
  endDate,
  endTime,
  timezoneOffset,
  taskAssignees,
  status
})

export const updateTask = Joi.object().keys({
  title: titleOptional,
  description,
  endDate,
  endTime,
  timezoneOffset,
  status: statusOptional
})

export const taskAssignment = Joi.object().keys({
  taskAssignees
})
