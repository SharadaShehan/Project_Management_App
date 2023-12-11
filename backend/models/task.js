import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  phase: { type: mongoose.Schema.Types.ObjectId, ref: 'Phase' },
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
  deadline: Date,
  taskAssignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed', 'Aborted'],
    default: 'Active'
  }
})

const Task = mongoose.model('Task', taskSchema)

export default Task
