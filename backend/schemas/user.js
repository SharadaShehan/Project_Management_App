import Joi from 'joi'

const username = Joi.string().alphanum().min(4).max(30).required().label('Username')
const password = Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,30})/).required().label('Password').messages({
  'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and be 8-30 characters long.'
})
const firstName = Joi.string().min(2).max(30).required().label('First name')
const lastName = Joi.string().min(2).max(30).required().label('Last name')
const gender = Joi.string().label('Gender')
const country = Joi.string().label('Country')
const primaryEmail = Joi.string().email().required().label('Email')
const secondaryEmail = Joi.string().email().label('Secondary Email')
const imageURL = Joi.string().uri().label('Image URL')

export const signIn = Joi.object().keys({
  username,
  password
})

export const signUp = Joi.object().keys({
  username,
  password,
  firstName,
  lastName,
  gender,
  country,
  primaryEmail,
  secondaryEmail,
  imageURL
})

export const updateProfile = Joi.object().keys({
  firstName,
  lastName,
  gender,
  country,
  primaryEmail,
  secondaryEmail,
  imageURL
})

export const changePassword = Joi.object().keys({
  currentPassword: password,
  newPassword: password
})
