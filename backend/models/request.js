import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String
})

const Request = mongoose.model('Request', requestSchema)

export default Request
