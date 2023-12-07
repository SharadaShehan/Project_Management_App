import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  gender: String,
  country: String,
  primaryEmail: String,
  secondaryEmail: String,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
})

const User = mongoose.model('User', userSchema)

export default User
