# Project Management App - AWS Serverless

A full-stack serverless project management application built with AWS AppSync, Lambda, DynamoDB, Cognito, and React Native.

## 🌟 Features

- **Project & Task Management**: Create projects, processes, phases, and tasks with role-based access
- **Real-time Messaging**: Private, project-wide, and phase-specific chat with WebSocket subscriptions
- **AI-Powered Forum**: Discussion board with Google Gemini AI-generated answers
- **User Authentication**: Secure authentication with AWS Cognito
- **File Upload**: Presigned S3 URLs for direct image uploads
- **Real-time Updates**: GraphQL subscriptions for live notifications

## 🏗️ Architecture

**Backend (AWS Serverless)**:
- **AppSync**: GraphQL API with 43 resolvers
- **Lambda**: 43 Node.js 20.x functions
- **DynamoDB**: Single-table design with 3 GSIs
- **Cognito**: User authentication & authorization
- **S3**: Image storage (private & public buckets)
- **CloudWatch**: Logging, metrics, and alarms
- **SSM**: Secure parameter storage

**Frontend**:
- **React Native**: Expo framework
- **Apollo Client**: GraphQL client with caching
- **AWS Amplify**: AWS service integration

**Infrastructure**:
- **Terraform**: Infrastructure as Code
- **100% Serverless**: Pay-per-use pricing model

## 📋 Prerequisites

- **AWS CLI** v2+ ([Install](https://aws.amazon.com/cli/))
- **Terraform** v1.5+ ([Install](https://www.terraform.io/downloads))
- **Node.js** v20+ ([Install](https://nodejs.org/))
- **AWS Account** with appropriate permissions
- **Google Gemini API Key** ([Get Key](https://makersuite.google.com/app/apikey))

## ⚡ Quick Start

### 1. Configure AWS

```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format
```

### 2. Set Configuration

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values:
#   - gemini_api_key: Your Google Gemini API key
#   - alert_email: Email for CloudWatch alerts
```

### 3. Deploy Everything

**macOS/Linux:**
```bash
chmod +x scripts/*.sh
./scripts/deploy.sh production
```

**Windows PowerShell:**
```powershell
.\scripts\deploy.ps1 production
```

The script will automatically:
- ✅ Build Lambda functions and layer
- ✅ Deploy all AWS infrastructure
- ✅ Generate frontend configuration
- ✅ Display deployment outputs

**Deployment time:** ~5-7 minutes

### 4. Run Frontend

```bash
cd frontend
npm install
npm start
```

Scan the QR code with Expo Go app on your phone!

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 10 minutes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture details
- **[lambda/README.md](lambda/README.md)** - Lambda functions documentation
- **[infrastructure/README.md](infrastructure/README.md)** - Terraform modules

## 🔧 Available Scripts

```bash
# Deploy to different environments
./scripts/deploy.sh development
./scripts/deploy.sh staging
./scripts/deploy.sh production

# Generate frontend config (after manual Terraform changes)
./scripts/generate-config.sh

# Test deployment
./scripts/test-deployment.sh

# Destroy all resources (⚠️ DELETES ALL DATA)
./scripts/destroy.sh
```

## 🧪 Testing

Verify deployment:

```bash
./scripts/test-deployment.sh
```

This checks:
- DynamoDB table
- Cognito User Pool
- AppSync API
- Lambda functions (43 expected)
- S3 buckets
- CloudWatch logs
- SSM parameters

## 📊 AWS Resources Created

| Service | Resources | Purpose |
|---------|-----------|---------|
| **AppSync** | 1 API | GraphQL API with 43 resolvers |
| **Lambda** | 43 Functions + 1 Layer | Business logic |
| **DynamoDB** | 1 Table + 3 GSIs | Data storage |
| **Cognito** | User Pool + App Client | Authentication |
| **S3** | 2 Buckets | File storage |
| **IAM** | 4 Roles + Policies | Access control |
| **CloudWatch** | Logs + Alarms + Dashboard | Monitoring |
| **SSM** | Parameter Store | Configuration |

## 💰 Estimated Costs

**Free Tier (First 12 months):**
- Most services covered by AWS Free Tier
- Cost: ~$5-10/month

**Beyond Free Tier (1000 MAU):**
- Lambda: $25/month
- DynamoDB: $15/month
- AppSync: $40/month
- S3: $25/month
- Cognito: $5/month
- CloudWatch: $10/month
- **Total: ~$120/month**

**Low traffic:** $5-20/month

## 🔄 Update Deployment

After making code changes:

```bash
# Rebuild and redeploy
./scripts/deploy.sh production
```

Terraform will:
- Detect changes
- Show diff
- Update only modified resources
- Preserve all data

## 🗑️ Cleanup

To destroy all resources:

```bash
./scripts/destroy.sh
# Type 'DELETE' to confirm
# Type environment name
# Type 'YES' to proceed
```

**⚠️ WARNING:** This permanently deletes all data!

## 📱 Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## 🐛 Troubleshooting

**AWS credentials not found:**
```bash
aws configure
aws sts get-caller-identity  # Verify
```

**Terraform state locked:**
```bash
cd infrastructure
terraform force-unlock <LOCK_ID>
```

**Lambda build fails:**
```bash
cd lambda
npm run clean
npm install
npm run build
```

**Can't retrieve outputs:**
```bash
cd infrastructure
terraform refresh
terraform output
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting.

## 🎯 Key Features Implementation

### User Management
- Sign up with email verification
- JWT-based authentication
- Profile management with image upload

### Project Hierarchy
```
Project (owner, members)
  └─ Process (workflow template)
      └─ Phase (workflow step)
          └─ Task (work items)
```

### Messaging System
- **Private**: Direct user-to-user messages
- **Project**: Broadcast to all members
- **Phase**: Messages within specific phase
- **Real-time**: WebSocket subscriptions

### AI Integration
- Forum posts with discussion threads
- Upvote/downvote system
- Google Gemini Pro AI-generated answers
- Context-aware responses

### Access Control
- Project Owner: Full CRUD + member management
- Project Member: Create/read/update
- Task Assignee: Update status
- Non-member: No access

## 🔐 Security

- ✅ Cognito JWT authentication
- ✅ IAM role-based access control
- ✅ S3 bucket encryption (AES256)
- ✅ SecureString parameters in SSM
- ✅ VPC isolation (optional)
- ✅ DynamoDB point-in-time recovery

## 🌐 Environments

Deploy to multiple isolated environments:

```bash
# Development (testing)
./scripts/deploy.sh development

# Staging (pre-production)
./scripts/deploy.sh staging

# Production (live)
./scripts/deploy.sh production
```

Each environment has its own:
- DynamoDB tables
- Lambda functions
- AppSync APIs
- Cognito User Pools
- S3 buckets

## 📈 Monitoring

Access AWS Console:
- **CloudWatch Dashboard**: Real-time metrics
- **CloudWatch Logs**: Function execution logs
- **X-Ray**: Distributed tracing
- **CloudWatch Alarms**: Email notifications

View logs:
```bash
aws logs tail /aws/lambda/project-mgmt-user-login --follow
```

## 🛠️ Technology Stack

**Backend:**
- AWS AppSync (GraphQL)
- AWS Lambda (Node.js 20.x ES Modules)
- Amazon DynamoDB
- Amazon Cognito
- Amazon S3
- Google Gemini Pro API

**Frontend:**
- React Native (Expo)
- Apollo Client
- AWS Amplify
- React Navigation

**Infrastructure:**
- Terraform (IaC)
- AWS CloudWatch
- AWS Systems Manager

**Development:**
- Node.js 20+
- ES Modules
- Bash/PowerShell scripts

## 📖 API Documentation

### GraphQL Schema

- **20 Queries**: Get data (users, projects, tasks, messages, etc.)
- **23 Mutations**: Create/update/delete operations
- **1 Subscription**: Real-time message updates

See `infrastructure/modules/appsync/schema.graphql` for full schema.

### Example Queries

```graphql
# Get current user
query Me {
  me {
    id
    username
    firstName
    lastName
    projects { id title }
  }
}

# List projects
query Projects {
  projects {
    id
    title
    description
    status
    logo
  }
}

# Create task
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    status
    assignee { username }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **SharadaShehan** - Initial work

## 🙏 Acknowledgments

- AWS Serverless Application Model
- Terraform AWS Provider
- React Native community
- Apollo GraphQL
- Google Gemini AI

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: Open GitHub issue
- **Architecture**: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🚀 Ready to Deploy?

```bash
./scripts/deploy.sh production
```

**That's it!** Your entire serverless infrastructure will be deployed in ~5-7 minutes.

---

**Built with ❤️ using AWS Serverless Architecture**
