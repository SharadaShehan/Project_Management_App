import mongoose, { Schema } from 'mongoose'
import hash from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: async email => await User.doesntExist({ email }),
      message: ({ value }) => `Email ${value} has already been taken.`
    }
  },
  username: {
    type: String,
    validate: {
      validator: async username => await User.doesntExist({ username }),
      message: ({ value }) => `Username ${value} has already been taken.`
    }
  },
  chats: [{
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  }],
  name: String,
  password: String
}, {
  timestamps: true
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hash.hash(this.password, 10)
  }
})

userSchema.statics.doesntExist = async function (options) {
  return await this.where(options).countDocuments() === 0
}

userSchema.methods.matchesPassword = async function (password) {
  return await hash.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
