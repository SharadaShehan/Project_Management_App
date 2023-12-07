import mongoose from 'mongoose'

const phaseSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' },
  title: String,
  description: String,
  order: Number,
  startDatetime: Date,
  endDatetime: Date,
  phaseAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  phaseMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: String
})

const Phase = mongoose.model('Phase', phaseSchema)

export default Phase
