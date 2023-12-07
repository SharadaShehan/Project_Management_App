import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' },
  phase: { type: mongoose.Schema.Types.ObjectId, ref: 'Phase' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  datetime: Date
})

const Message = mongoose.model('Message', messageSchema)

export default Message
