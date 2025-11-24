# Lambda Functions - Project Management App

This directory contains all AWS Lambda functions for the serverless GraphQL API.

## Structure

```
lambda/
├── package.json              # Dependencies and build scripts
├── shared/                   # Shared utilities (imported by all functions)
│   ├── dynamodb.js          # DynamoDB client and query helpers
│   ├── validation.js        # Input validation utilities
│   ├── auth.js              # Authentication/authorization helpers
│   ├── errors.js            # Error handling and Lambda wrapper
│   ├── s3.js                # S3 presigned URL generation
│   └── ssm.js               # Parameter Store utilities
├── user/                     # User management functions
│   ├── signup.js            # User registration
│   ├── login.js             # User authentication
│   ├── getProfile.js        # Get user profile
│   └── updateProfile.js     # Update user profile
├── cognito/                  # Cognito trigger functions
│   ├── preSignup.js         # Pre-signup validation
│   └── postConfirmation.js  # Sync user to DynamoDB
├── image/                    # Image processing functions
│   └── generatePresignedUrl.js  # Generate S3 upload URLs
├── project/                  # Project management (to be implemented)
├── process/                  # Process management (to be implemented)
├── phase/                    # Phase management (to be implemented)
├── task/                     # Task management (to be implemented)
├── forum/                    # Forum/discussion functions (to be implemented)
├── message/                  # Messaging functions (to be implemented)
└── request/                  # Request management (to be implemented)
```

## Completed Functions

### ✅ Shared Utilities (7 files)
- **dynamodb.js**: DynamoDB DocumentClient with helpers for get, put, update, delete, query, GSI queries, batch operations
- **validation.js**: Input validators for email, username, password, IDs, statuses, dates, file types
- **auth.js**: Authentication helpers to extract user info from Cognito JWT, authorization checks
- **errors.js**: Custom error classes (AppError, ValidationError, AuthenticationError, etc.) and Lambda handler wrapper
- **s3.js**: S3 presigned URL generation for secure file uploads
- **ssm.js**: Parameter Store helpers with caching for secure configuration

### ✅ User Functions (4 files)
- **signup.js**: Register new user in Cognito + DynamoDB
- **login.js**: Authenticate user and return JWT tokens
- **getProfile.js**: Get current user's profile
- **updateProfile.js**: Update user profile information

### ✅ Cognito Triggers (2 files)
- **preSignup.js**: Pre-signup validation (auto-confirm for dev)
- **postConfirmation.js**: Sync confirmed user to DynamoDB

### ✅ Image Processing (1 file)
- **generatePresignedUrl.js**: Generate S3 presigned URLs for image uploads

**Total Completed**: 14 files (~1,400 lines of code)

## Environment Variables

All Lambda functions expect the following environment variables (set by Terraform):

```bash
DYNAMODB_TABLE_NAME           # Main DynamoDB table name
S3_PRIVATE_BUCKET            # Private S3 bucket for user images
S3_PUBLIC_BUCKET             # Public S3 bucket for project logos
COGNITO_USER_POOL_ID         # Cognito User Pool ID
COGNITO_APP_CLIENT_ID        # Cognito App Client ID
GEMINI_API_KEY_PARAM         # SSM parameter name for Gemini API key
AWS_NODEJS_CONNECTION_REUSE_ENABLED=1  # Improve performance
```

## Building and Deployment

### Install Dependencies

```bash
npm install
```

### Build Lambda Layer

The Lambda layer contains all npm dependencies shared across functions:

```bash
npm run build:layer
```

This creates `layers/dependencies.zip` with:
- AWS SDK v3 clients (DynamoDB, S3, Cognito, SSM)
- Google Generative AI SDK
- UUID library

### Package Lambda Functions

```bash
npm run build:functions
```

This creates `dist/lambda.zip` containing all function code.

### Deploy with Terraform

```bash
cd ../infrastructure
terraform apply
```

Terraform will upload both `dependencies.zip` (layer) and `lambda.zip` (functions).

## Function Invocation

Functions are invoked by AWS AppSync GraphQL API. AppSync passes:

```javascript
{
  "arguments": { /* GraphQL mutation/query arguments */ },
  "identity": { /* Cognito user identity (sub, username, claims) */ },
  "source": { /* Parent object for nested resolvers */ },
  "request": { /* HTTP request details */ },
  "info": { /* GraphQL field info */ }
}
```

## Error Handling

All functions use the `lambdaHandler` wrapper which:
1. Logs input event
2. Executes function
3. Catches errors
4. Returns formatted error response
5. Logs result

Custom error types:
- **ValidationError** (400): Invalid input
- **AuthenticationError** (401): Auth failed
- **AuthorizationError** (403): Permission denied
- **NotFoundError** (404): Resource not found
- **ConflictError** (409): Duplicate resource
- **InternalError** (500): Server error

## Testing Locally

You can test functions locally using the AWS SAM CLI:

```bash
# Install SAM CLI
brew install aws-sam-cli

# Invoke function with test event
sam local invoke UserSignupFunction -e test-events/signup.json
```

Example test event (`test-events/signup.json`):

```json
{
  "arguments": {
    "username": "testuser",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "primaryEmail": "test@example.com"
  },
  "identity": {}
}
```

## Monitoring

### CloudWatch Logs

All functions log to CloudWatch Logs:
- Log Group: `/aws/lambda/<project-name>-<environment>-<function-name>`
- Retention: 7 days
- Format: Structured JSON logs

### CloudWatch Metrics

Automatic metrics:
- **Invocations**: Number of function executions
- **Duration**: Execution time
- **Errors**: Number of errors
- **Throttles**: Number of throttled requests

### X-Ray Tracing

All functions have X-Ray tracing enabled for distributed tracing and performance analysis.

## Best Practices

### 1. Connection Reuse
Set `AWS_NODEJS_CONNECTION_REUSE_ENABLED=1` to reuse HTTP connections.

### 2. Cold Start Optimization
- Keep functions small and focused
- Use Lambda layers for shared dependencies
- Minimize dependencies in deployment package

### 3. Error Handling
Always use the `lambdaHandler` wrapper:

```javascript
import { lambdaHandler } from '../shared/errors.js';

async function myFunction(event) {
  // Your logic here
}

export const handler = lambdaHandler(myFunction);
```

### 4. Input Validation
Always validate input before processing:

```javascript
import { validateRequiredFields, isValidEmail } from '../shared/validation.js';

validateRequiredFields(args, ['field1', 'field2']);
if (!isValidEmail(args.email)) {
  throw new ValidationError('Invalid email');
}
```

### 5. Authorization
Check permissions before accessing resources:

```javascript
import { getUserIdFromContext, authorizeOwner } from '../shared/auth.js';

const userId = getUserIdFromContext(event.identity);
authorizeOwner(userId, resource.ownerId);
```

## Remaining Implementation

The following functions still need to be implemented:

### Project Functions (7 functions)
- create.js
- get.js
- update.js
- delete.js
- list.js
- inviteUser.js
- getMembers.js

### Process Functions (5 functions)
- create.js, get.js, update.js, delete.js, list.js

### Phase Functions (5 functions)
- create.js, get.js, update.js, delete.js, list.js

### Task Functions (6 functions)
- create.js, get.js, update.js, delete.js, list.js, updateStatus.js

### Forum Functions (6 functions)
- createPost.js, getPost.js, updatePost.js, deletePost.js, listPosts.js, generateAIAnswer.js

### Message Functions (4 functions)
- send.js, listPrivate.js, listProject.js, listPhase.js

### Request Functions (4 functions)
- create.js, list.js, accept.js, decline.js

**Total Remaining**: 37 functions (~3,000-3,500 lines of code)

## Contributing

When adding new functions:
1. Place in appropriate directory (user/, project/, etc.)
2. Import shared utilities from `../shared/`
3. Use `lambdaHandler` wrapper for error handling
4. Validate all inputs
5. Check authorization before mutations
6. Log important events
7. Return data in expected GraphQL format
8. Update this README

## License

Proprietary - Project Management App
