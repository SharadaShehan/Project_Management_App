import Joi from 'joi'
import mongoose from 'mongoose'

const sender = Joi.string().external(async (value) => {
  const user = await mongoose.model('User').findById(value)
  if (!user) throw new Error('Invalid user')
}).required().label('Sender')
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
