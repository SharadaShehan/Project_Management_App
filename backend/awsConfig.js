import { AWS_IAM_ROLE_ACCESS_KEY_ID, AWS_IAM_ROLE_SECRET_ACCESS_KEY, AWS_IAM_ROLE_REGION } from './config.js'
import AWS from 'aws-sdk'

AWS.config.update({
  accessKeyId: AWS_IAM_ROLE_ACCESS_KEY_ID,
  secretAccessKey: AWS_IAM_ROLE_SECRET_ACCESS_KEY,
  region: AWS_IAM_ROLE_REGION
})

export default AWS
