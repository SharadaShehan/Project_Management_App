import mongoose from 'mongoose'

const phaseSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' },
  title: String,
  description: String,
  order: Number,
  startDatetime: Date,
  endDatetime: Date,
  status: String
})

const Phase = mongoose.model('Phase', phaseSchema)

export default Phase
