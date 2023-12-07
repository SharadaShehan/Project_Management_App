import mongoose from 'mongoose'

const processSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: String,
  description: String,
  priority: Number,
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: String
})

const Process = mongoose.model('Process', processSchema)

export default Process
