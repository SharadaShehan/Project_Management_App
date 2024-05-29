import dotenv from 'dotenv'

dotenv.config()

export const {
  APP_PORT,
  NODE_ENV,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_STRING,
  SESS_NAME,
  SESS_SECRET,
  SESS_LIFETIME,
  REDIS_URL
} = process.env

export const IN_PROD = NODE_ENV === 'production'
