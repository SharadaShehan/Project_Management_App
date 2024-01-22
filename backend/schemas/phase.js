import Joi from 'joi'
import mongoose from 'mongoose'

const datePattern = /^\d{4}-\d{2}-\d{2}$|^$/
const timePattern = /^\d{2}:\d{2}$|^$/

const title = Joi.string().min(2).max(30).required().label('Title')
const titleOptional = Joi.string().min(2).max(30).label('Title')
const description = Joi.string().min(5).max(300).label('Description')
const process = Joi.string().external(async (value) => {
  const process = await mongoose.model('Process').findById(value)
  if (!process) throw new Error('Invalid process')
}).required().label('Process')
const order = Joi.number().integer().min(1).required().label('Order')
const startDate = Joi.string().regex(datePattern).label('Start date')
const endDate = Joi.string().min(0).regex(datePattern).label('End date')
const endTime = Joi.string().min(0).regex(timePattern).label('End time')
const timezoneOffset = Joi.number().integer().min(-720).max(840).default(0).label('Timezone offset')
const phaseAdmins = Joi.array().unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Phase admins')
const phaseMembers = Joi.array().unique().items(Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
})).label('Phase members')
const status = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').required().label('Status')
const statusOptional = Joi.string().valid('Active', 'Inactive', 'Completed', 'Aborted').default('Active').label('Status')
const previousOrders = Joi.array().unique().items(Joi.number().integer().min(1)).label('Previous orders')
const newOrders = Joi.array().unique().items(Joi.number().integer().min(1)).label('New orders')
const tasks = Joi.array().unique().items(Joi.string().external(async (value) => {
  const task = await mongoose.model('Task').findById(value)
  if (!task) throw new Error('Invalid task')
})).label('Tasks')

export const createPhase = Joi.object().keys({
  title,
  description,
  process,
  order,
  startDate,
  endDate,
  endTime,
  timezoneOffset,
  status,
  phaseAdmins,
  phaseMembers,
  tasks
})

export const updatePhase = Joi.object().keys({
  title: titleOptional,
  description,
  startDate,
  endDate,
  endTime,
  timezoneOffset,
  status: statusOptional
})

export const adminsUpdate = Joi.object().keys({
  admins: phaseAdmins
})

export const membersUpdate = Joi.object().keys({
  members: phaseMembers
})

export const orderUpdate = Joi.object().keys({
  previousOrders,
  newOrders
})
