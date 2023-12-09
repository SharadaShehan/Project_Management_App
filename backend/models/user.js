import mongoose from 'mongoose'
import hash from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    validate: {
      validator: async (username) => User.isUsernameValid(username),
      message: ({ value }) => `Username ${value} has already been taken.`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 30
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  gender: String,
  country: String,
  primaryEmail: {
    type: String,
    required: true,
    validate: {
      validator: async (email) => User.isEmailValid(email),
      message: ({ value }) => `Email ${value} has already been taken.`
    }
  },
  secondaryEmail: {
    type: String,
    validate: {
      validator: async (email) => User.isEmailValid(email),
      message: ({ value }) => `Email ${value} has already been taken.`
    }
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hash.hash(this.password, 10)
  }
})

userSchema.statics.doesntExist = async function (options) {
  return await this.where(options).countDocuments() === 0
}

userSchema.statics.isUsernameValid = async function (username) {
  const USERNAME_REGEX = /^[a-zA-Z0-9_]{8,30}$/
  if (!USERNAME_REGEX.test(username)) {
    return false
  }
  return await this.where({ username }).countDocuments() === 0
}

userSchema.statics.isEmailValid = async function (email) {
  const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
  if (!EMAIL_REGEX.test(email)) {
    return false
  }
  return await this.where({ primaryEmail: email }).countDocuments() === 0
}

userSchema.methods.matchesPassword = async function (password) {
  return await hash.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
