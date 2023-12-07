import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' },
  phase: { type: mongoose.Schema.Types.ObjectId, ref: 'Phase' },
  title: String,
  description: String,
  deadline: Date,
  status: String
})

const Task = mongoose.model('Task', taskSchema)

export default Task
