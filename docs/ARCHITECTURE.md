# AWS Serverless Architecture Documentation

## Overview

This document provides a detailed technical overview of the AWS serverless architecture for the Project Management Application.

## System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        End Users                                │
│              (iOS, Android, Web Browsers)                       │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                   React Native Frontend                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ AWS Amplify  │  │Apollo Client │  │    Expo      │        │
│  │     Auth     │  │   GraphQL    │  │  Framework   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            │ GraphQL over HTTPS
                            │ WebSocket (Subscriptions)
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    AWS AppSync GraphQL API                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Schema: 43 GraphQL Resolvers                           │  │
│  │  - Queries: 20  - Mutations: 20  - Subscriptions: 3    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐       │
│  │Cognito User Pools│◄────────────►│ Lambda Resolvers │       │
│  │  Authorization   │              │   (43 Functions) │       │
│  └──────────────────┘              └──────────────────┘       │
└───────────────────────────┬────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   DynamoDB     │  │  S3 Buckets  │  │  SSM Parameter   │
│  Single Table  │  │              │  │     Store        │
│                │  │ ┌──────────┐ │  │                  │
│ ┌────────────┐ │  │ │ Private  │ │  │ ┌──────────────┐ │
│ │Primary Key │ │  │ │  Bucket  │ │  │ │Gemini API Key│ │
│ │    + 3     │ │  │ └──────────┘ │  │ └──────────────┘ │
│ │    GSIs    │ │  │ ┌──────────┐ │  └──────────────────┘
│ └────────────┘ │  │ │  Public  │ │
└────────────────┘  │ │  Bucket  │ │
                    │ └──────────┘ │
                    └──────────────┘
         │
         ▼
┌────────────────────────────────────┐
│      CloudWatch Monitoring         │
│                                    │
│  ┌──────────┐  ┌─────────┐       │
│  │   Logs   │  │ Metrics │       │
│  └──────────┘  └─────────┘       │
│  ┌──────────┐  ┌─────────┐       │
│  │  Alarms  │  │Dashboard│       │
│  └──────────┘  └─────────┘       │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│    Google Gemini Pro API           │
│   (AI Answer Generation)           │
└────────────────────────────────────┘
```

## Component Details

### 1. AWS AppSync (GraphQL API)

**Purpose**: Managed GraphQL API layer providing real-time capabilities

**Configuration**:
- Authentication: Cognito User Pools
- Authorization: JWT token validation
- Real-time: WebSocket subscriptions
- Schema: Type-safe GraphQL definitions

**Resolvers (43 total)**:
- Direct Lambda integration
- Request/response mapping via event context
- Automatic batching and caching

**Key Features**:
- Automatic pagination
- Field-level authorization
- Real-time subscriptions for messages
- Conflict resolution (eventual consistency)

### 2. AWS Lambda Functions

**Runtime**: Node.js 20.x with ES Modules

**Architecture Pattern**:
```javascript
// Shared utilities layer
import { lambdaHandler } from './shared/errors.js';
import { getUserIdFromContext } from './shared/auth.js';
import { getItem, putItem } from './shared/dynamodb.js';

// Function handler
async function businessLogic(event) {
  // 1. Authentication
  const userId = getUserIdFromContext(event.identity);
  
  // 2. Authorization
  // Check project membership, ownership, etc.
  
  // 3. Validation
  // Input validation using shared utilities
  
  // 4. Business Logic
  // DynamoDB operations, external API calls
  
  // 5. Return Response
  return result;
}

// Wrapped export for error handling
export const handler = lambdaHandler(businessLogic);
```

**Function Categories**:

| Category | Count | Examples |
|----------|-------|----------|
| User Management | 4 | signup, login, getProfile, updateProfile |
| Project CRUD | 7 | create, get, update, delete, list, inviteUser, getMembers |
| Process Management | 5 | create, get, update, delete, list |
| Phase Management | 5 | create, get, update, delete, list |
| Task Management | 6 | create, get, update, updateStatus, delete, list |
| Forum & AI | 6 | create, get, createReply, generateAIAnswer, delete, list |
| Messaging | 4 | send, list, markAsRead, delete |
| Invitations | 4 | create, accept, decline, list |
| Image Processing | 1 | generatePresignedUrl |
| Cognito Triggers | 2 | preSignup, postConfirmation |

**Shared Utilities**:
- `dynamodb.js`: DynamoDB client with helper methods
- `validation.js`: Input validation functions
- `auth.js`: Authentication and authorization
- `errors.js`: Error handling and HTTP status codes
- `s3.js`: S3 operations (presigned URLs)
- `ssm.js`: Parameter Store access with caching

### 3. Amazon DynamoDB

**Table Design**: Single-table design pattern

**Primary Key Structure**:
```
PK (Partition Key): Entity identifier
SK (Sort Key): Metadata or relationship

Examples:
- USER#uuid / METADATA
- PROJECT#uuid / MEMBER#userid
- TASK#uuid / METADATA
```

**Global Secondary Indexes**:

**GSI1** (Username Lookup):
```
GSI1PK: USERNAME#username
GSI1SK: METADATA
Use case: Find user by username
```

**GSI2** (Entity Type + Status):
```
GSI2PK: TASK
GSI2SK: IN_PROGRESS
Use case: Query all tasks with specific status
```

**GSI3** (Timeline):
```
GSI3PK: PROJECT#uuid
GSI3SK: 2024-01-15T10:30:00Z
Use case: Get chronological posts/messages
```

**Access Patterns**:

| Pattern | Keys | Example |
|---------|------|---------|
| Get user by ID | PK=USER#id, SK=METADATA | User profile |
| Get project members | PK=PROJECT#id, SK begins_with MEMBER# | List members |
| Get user's projects | PK=USER#id, SK begins_with PROJECT# | User's projects |
| Query tasks by status | GSI2PK=TASK, GSI2SK=TODO | Backlog tasks |
| Get recent messages | GSI3PK=PHASE#id, sort by GSI3SK | Message history |

**Capacity**:
- Provisioned: 5 RCU / 5 WCU (adjustable)
- Auto-scaling: Enabled (10-100 units)
- Point-in-time recovery: Enabled

### 4. Amazon Cognito

**User Pool Configuration**:
```
- Username attributes: email
- Password policy: 8+ chars, uppercase, lowercase, number, special
- MFA: Optional
- Email verification: Required
- Token expiration: Access (1 hour), Refresh (30 days)
```

**User Attributes**:
- Standard: email, email_verified
- Custom: (managed in DynamoDB)

**Triggers**:
- Pre-signup: Email validation
- Post-confirmation: Create DynamoDB user record

**Identity Pool**:
- Authenticated role: Access to S3 (own prefix)
- Guest role: None

### 5. Amazon S3

**Bucket Strategy**: Two-bucket approach

**Private Bucket**:
```
Name: project-mgmt-private-<account-id>
Access: Authenticated users only
Prefix: users/{userId}/*
Use case: User profile images, project files
CORS: Configured for React Native
```

**Public Bucket**:
```
Name: project-mgmt-public-<account-id>
Access: Public read, authenticated write
Use case: Project logos, shared assets
CDN: CloudFront distribution (optional)
```

**Image Upload Flow**:
```
1. Frontend requests presigned URL
   ↓
2. Lambda generates S3 presigned URL (15 min expiry)
   ↓
3. Frontend uploads directly to S3
   ↓
4. Frontend sends S3 key to GraphQL mutation
   ↓
5. Lambda stores reference in DynamoDB
```

### 6. CloudWatch Monitoring

**Logs**:
- Lambda: `/aws/lambda/<function-name>`
- AppSync: `/aws/appsync/apis/<api-id>`
- Retention: 7 days (configurable)

**Metrics**:
- Lambda invocations, errors, duration
- DynamoDB consumed capacity
- AppSync request count, latency

**Alarms**:
- Lambda error rate > 5%
- DynamoDB throttling events
- AppSync 5xx errors

**Dashboard**:
- Real-time metrics visualization
- Custom time ranges
- Multi-region support

## Data Flow Examples

### Example 1: Create Task

```
1. User submits task creation form
   ↓
2. Frontend sends GraphQL mutation with JWT
   mutation CreateTask($input: CreateTaskInput!) {
     createTask(input: $input) { id, title, status }
   }
   ↓
3. AppSync validates JWT with Cognito
   ↓
4. AppSync invokes task/create.js Lambda
   Event: { identity: { sub, username }, arguments: { input } }
   ↓
5. Lambda validates input and authorization
   - Check project membership
   - Validate assignee is member
   - Check required fields
   ↓
6. Lambda creates DynamoDB items
   - TASK#uuid / METADATA
   - PHASE#uuid / TASK#uuid
   - USER#assignee / TASK#uuid
   ↓
7. Lambda returns task object
   ↓
8. AppSync returns response to frontend
   ↓
9. Frontend updates UI and cache
```

### Example 2: Real-time Message

```
1. User sends message in project chat
   ↓
2. Frontend sends GraphQL mutation
   mutation SendMessage($input: SendMessageInput!) {
     sendMessage(input: $input) { id, content, sender }
   }
   ↓
3. Lambda creates message in DynamoDB
   PK: PROJECT#uuid
   SK: MESSAGE#uuid
   ↓
4. AppSync subscription triggered
   subscription OnNewMessage($projectId: ID!) {
     onNewMessage(projectId: $projectId) { ... }
   }
   ↓
5. All subscribed clients receive message
   (via WebSocket connection)
   ↓
6. Frontend displays new message in real-time
```

### Example 3: AI Forum Answer

```
1. User requests AI answer for forum post
   ↓
2. Frontend sends generateAIAnswer mutation
   ↓
3. Lambda retrieves post from DynamoDB
   ↓
4. Lambda gets Gemini API key from SSM
   ↓
5. Lambda calls Gemini Pro API
   POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   Body: { contents: [{ parts: [{ text: prompt }] }] }
   ↓
6. Gemini returns AI-generated answer
   ↓
7. Lambda creates reply in DynamoDB
   - POST#uuid / REPLY#uuid
   - Set isAIGenerated: true
   - Update reply count
   ↓
8. Lambda returns formatted reply
   ↓
9. Frontend displays AI answer
```

## Security Architecture

### Authentication Flow

```
┌─────────────┐
│   Sign Up   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Cognito Pre-     │
│ Signup Lambda    │ ──► Validate email format
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Email Verification│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Cognito Post-    │
│ Confirmation     │ ──► Create DynamoDB user
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Sign In        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ JWT Tokens       │
│ - Access Token   │ ──► API authentication
│ - ID Token       │ ──► User info
│ - Refresh Token  │ ──► Token renewal
└──────────────────┘
```

### Authorization Levels

**Project Level**:
- Owner: Full CRUD + member management
- Member: Create/read/update, limited delete
- Non-member: No access

**Task Level**:
- Assignee: Update status, edit details
- Project member: View, comment
- Project owner: Full control

**Message Level**:
- Sender: Delete own messages
- Project owner: Delete any message
- Member: Read messages

### IAM Roles

**Lambda Execution Role**:
```json
{
  "PolicyName": "LambdaExecutionPolicy",
  "Permissions": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:DeleteItem",
    "dynamodb:Query",
    "dynamodb:BatchGetItem",
    "s3:GetObject",
    "s3:PutObject",
    "ssm:GetParameter",
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents"
  ]
}
```

**Cognito Authenticated Role**:
```json
{
  "PolicyName": "CognitoAuthenticatedPolicy",
  "Permissions": [
    "s3:GetObject - users/${cognito-identity.amazonaws.com:sub}/*",
    "s3:PutObject - users/${cognito-identity.amazonaws.com:sub}/*",
    "appsync:GraphQL"
  ]
}
```

## Performance Optimization

### Caching Strategy

**AppSync**:
- TTL: 60 seconds for list queries
- Cache key: Query + variables
- Invalidation: Automatic on mutations

**DynamoDB**:
- DAX (optional): Microsecond latency
- Client-side caching: Apollo InMemoryCache
- GSI projections: Only necessary attributes

### Batch Operations

```javascript
// Instead of multiple getItem calls
const users = await Promise.all(
  userIds.map(id => getItem(`USER#${id}`, 'METADATA'))
);

// Use batchGetItems
const users = await batchGetItems(
  userIds.map(id => ({ PK: `USER#${id}`, SK: 'METADATA' }))
);
```

### Connection Pooling

Lambda reuses container:
```javascript
// Outside handler - reused across invocations
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });

// Inside handler
export const handler = async (event) => {
  // Use cached client
  const result = await dynamoClient.send(command);
};
```

## Cost Optimization

### Estimated Monthly Costs (1000 active users)

| Service | Usage | Cost |
|---------|-------|------|
| AppSync | 10M requests | ~$40 |
| Lambda | 5M invocations, 512MB | ~$25 |
| DynamoDB | 5 RCU/WCU + auto-scale | ~$15 |
| S3 | 100GB storage, 1M requests | ~$25 |
| Cognito | 1000 MAUs | ~$5 |
| CloudWatch | Logs + metrics | ~$10 |
| **Total** | | **~$120/month** |

### Cost Reduction Strategies

1. **Use Reserved Capacity** for DynamoDB
2. **Implement S3 Lifecycle Policies**
3. **Optimize Lambda Memory** (right-size)
4. **Use S3 Intelligent Tiering**
5. **Reduce CloudWatch Log Retention**

## Disaster Recovery

### Backup Strategy

**DynamoDB**:
- Point-in-time recovery: 35-day window
- On-demand backups: Monthly
- Cross-region replication: Optional

**S3**:
- Versioning: Enabled
- Cross-region replication: Optional
- Lifecycle policies: Archive to Glacier

### Recovery Procedures

**Database Recovery**:
```bash
# Restore from point-in-time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name project-management-table \
  --target-table-name project-management-table-restored \
  --restore-date-time 2024-01-15T10:00:00Z
```

**Infrastructure Recovery**:
```bash
# Terraform state recovery
terraform import aws_dynamodb_table.main project-management-table

# Full redeployment
terraform destroy
terraform apply
```

## Conclusion

This architecture provides:
- ✅ Scalability: Auto-scaling at every layer
- ✅ High Availability: Multi-AZ deployment
- ✅ Security: Cognito + IAM + encryption
- ✅ Performance: Sub-100ms response times
- ✅ Cost-Effective: Pay-per-use pricing
- ✅ Maintainability: IaC with Terraform
- ✅ Monitoring: Comprehensive CloudWatch integration

---

**Last Updated**: November 2025

