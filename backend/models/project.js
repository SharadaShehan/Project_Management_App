import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed', 'Aborted'],
    default: 'Active'
  },
  processes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Process' }],
  defaultProcess: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' }
})

const Project = mongoose.model('Project', projectSchema)

export default Project
