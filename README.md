# Project Management App

## Backend Deployment Guide

1) Create an account in Google AI Studio and get an API key to access Gemini API.

2) Install AWS CLI. Then configure it with your AWS credentials using below command:
    ```
    aws configure
    ```

3) Navigate to the `backend` directory. Run below command to Login to AWS ECR. Replace `<your-aws-account-id>` with your AWS account ID and `<region>` with the region. Throughout this guide, use same region that you used in AWS CLI configuration.
    ```
    aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <your-aws-account-id>.dkr.ecr.<region>.amazonaws.com
    ```

4) Create a repository in AWS ECR. Replace `<repository-name>` with the repository name you want to use.
    ```
    aws ecr create-repository --repository-name <repository-name>
    ```

5) Run below command to build the Docker image. Replace `<image-name>` with the image name you want to use.
    ```
    docker build -t <image-name> .
    ```

6) Run below command to tag the Docker image. Replace `<your-aws-account-id>`, `<region>` and `<repository-name>` with your AWS account ID, region and repository name respectively.
    ```
    docker tag <image-name>:latest <your-aws-account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>:latest
    ```

7) Run below command to push the Docker image to AWS ECR. Replace `<your-aws-account-id>`, `<region>` and `<repository-name>` with your AWS account ID, region and repository name respectively.
    ```
    docker push <your-aws-account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>:latest
    ```

8) Navigate to the `deployment` directory. and run below command to create a S3 bucket for storing deployment artifacts. Replace `<your-bucket-name>` with your bucket name.
    ```
    aws s3 mb s3://<your-bucket-name>
    ```

9) Run below command to upload the deployment artifacts to the S3 bucket. Replace `<your-bucket-name>` with your bucket name.
    ```
    aws s3 cp lambda-layer.zip s3://<your-bucket-name>/
    ```

10) Run below command to create a CloudFormation stack for deploying the backend. Replace `<your-stack-name>`, `<your-config-bucket-name>`, `<your-aws-account-id>`, `<region>`, `<repository-name>` and `<gemini-api-key>` with your stack name, config bucket name, AWS account ID, region, repository name and Gemini API key respectively.
    ```
    aws cloudformation create-stack --stack-name <your-stack-name> --template-body file://deploy_resources.yaml  --capabilities CAPABILITY_NAMED_IAM --profile default --parameters ParameterKey=ECRRepository,ParameterValue="<your-aws-account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>" ParameterKey=GeminiAPIKey,ParameterValue="<gemini-api-key>" ParameterKey=ConfigBucket,ParameterValue="<your-config-bucket-name>" 
    ```

11) Update the stack (adding lambda triggering notification) by running below command. Replace `<your-stack-name>`, `<your-config-bucket-name>`, `<your-aws-account-id>`, `<region>`, `<repository-name>` and `<gemini-api-key>` with your stack name, config bucket name, AWS account ID, region, repository name and Gemini API key respectively.
    ```
    aws cloudformation update-stack --stack-name <your-stack-name> --template-body file://add_lambda_notification.yaml  --capabilities CAPABILITY_NAMED_IAM --profile default --parameters ParameterKey=ECRRepository,ParameterValue="<your-aws-account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>" ParameterKey=GeminiAPIKey,ParameterValue="<gemini-api-key>" ParameterKey=ConfigBucket,ParameterValue="<your-config-bucket-name>" 
    ```

12) Go to AWS CloudFormation console and check the status of the stack. Once the stack status is `CREATE_COMPLETE`, the backend is deployed successfully. You can get the backend IP address from the stack outputs.
