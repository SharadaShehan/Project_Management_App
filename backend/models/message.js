import mongoose from 'mongoose'

const projectMessageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000
  },
  index: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const phaseMessageSchema = new mongoose.Schema({
  phase: { type: mongoose.Schema.Types.ObjectId, ref: 'Phase' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000
  },
  index: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const privateMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000
  },
  index: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
})

const ProjectMessage = mongoose.model('ProjectMessage', projectMessageSchema)
const PhaseMessage = mongoose.model('PhaseMessage', phaseMessageSchema)
const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema)

export { ProjectMessage, PhaseMessage, PrivateMessage }
