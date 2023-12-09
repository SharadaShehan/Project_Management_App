import mongoose from 'mongoose'

const processSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  description: {
    type: String,
    minlength: 5,
    maxlength: 100
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed', 'Aborted'],
    default: 'Active'
  }
})

const Process = mongoose.model('Process', processSchema)

export default Process
