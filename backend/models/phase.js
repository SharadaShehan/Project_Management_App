import mongoose from 'mongoose'

const phaseSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  process: { type: mongoose.Schema.Types.ObjectId, ref: 'Process' },
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
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  startDatetime: Date,
  endDatetime: Date,
  phaseAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  phaseMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: String
})

const Phase = mongoose.model('Phase', phaseSchema)

export default Phase
