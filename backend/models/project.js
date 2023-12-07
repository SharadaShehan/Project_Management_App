import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: String
})

const Project = mongoose.model('Project', projectSchema)

export default Project
