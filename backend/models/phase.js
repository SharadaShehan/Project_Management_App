import mongoose from 'mongoose'

const phaseSchema = new mongoose.Schema({
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
    maxlength: 300
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  startDate: String,
  endDate: String,
  endTime: String,
  timezoneOffset: Number,
  phaseAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  phaseMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed', 'Aborted'],
    default: 'Active'
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
})

const Phase = mongoose.model('Phase', phaseSchema)

export default Phase
