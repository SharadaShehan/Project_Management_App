// Create Project Request/Invitation Handler
import { getItem, putItem, queryItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createRequest(event) {
  const { projectId, recipientId, message } = event.arguments;
  
  // Get authenticated user (sender)
  const senderId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ projectId, recipientId }, ['projectId', 'recipientId']);
  
  // Can't invite yourself
  if (senderId === recipientId) {
    throw new ValidationError('Cannot send invitation to yourself');
  }
  
  // Get project
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Only project members can send invitations
  if (!project.memberIds.includes(senderId)) {
    throw new AuthorizationError('Only project members can send invitations');
  }
  
  // Check if recipient exists
  const recipient = await getItem(`USER#${recipientId}`, 'METADATA');
  
  if (!recipient) {
    throw new NotFoundError('Recipient user');
  }
  
  // Check if recipient is already a member
  if (project.memberIds.includes(recipientId)) {
    throw new ValidationError('User is already a member of this project');
  }
  
  // Check if there's already a pending request
  const existingRequests = await queryItems(`PROJECT#${projectId}`, 'REQUEST#');
  const pendingRequest = existingRequests.find(
    r => r.recipientId === recipientId && r.status === 'PENDING'
  );
  
  if (pendingRequest) {
    throw new ValidationError('There is already a pending invitation for this user');
  }
  
  // Get sender details
  const sender = await getItem(`USER#${senderId}`, 'METADATA');
  
  // Generate request ID
  const requestId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create request item
  const requestItem = {
    PK: `REQUEST#${requestId}`,
    SK: 'METADATA',
    GSI2PK: 'REQUEST',
    GSI2SK: 'PENDING',
    EntityType: 'Request',
    id: requestId,
    projectId,
    senderId,
    recipientId,
    message: message || null,
    status: 'PENDING',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(requestItem);
  
  // Create project-request relationship
  const projectRequestItem = {
    PK: `PROJECT#${projectId}`,
    SK: `REQUEST#${requestId}`,
    EntityType: 'ProjectRequest',
    projectId,
    requestId,
    recipientId,
    status: 'PENDING',
    createdAt: timestamp
  };
  
  await putItem(projectRequestItem);
  
  // Create user-request relationship (for recipient)
  const userRequestItem = {
    PK: `USER#${recipientId}`,
    SK: `REQUEST#${requestId}`,
    EntityType: 'UserRequest',
    userId: recipientId,
    requestId,
    projectId,
    senderId,
    status: 'PENDING',
    isUnread: true,
    createdAt: timestamp
  };
  
  await putItem(userRequestItem);
  
  // Return request
  return {
    id: requestId,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      imageURL: project.imageURL
    },
    sender: {
      id: sender.id,
      username: sender.username,
      firstName: sender.firstName,
      lastName: sender.lastName,
      gender: sender.gender,
      imageURL: sender.imageURL
    },
    recipient: {
      id: recipient.id,
      username: recipient.username,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      gender: recipient.gender,
      imageURL: recipient.imageURL
    },
    message,
    status: 'PENDING',
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(createRequest);
