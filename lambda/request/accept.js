// Accept Project Request Handler
import { getItem, updateItem, putItem, deleteItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function acceptRequest(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get request
  const request = await getItem(`REQUEST#${id}`, 'METADATA');
  
  if (!request) {
    throw new NotFoundError('Request');
  }
  
  // Only the recipient can accept the request
  if (request.recipientId !== userId) {
    throw new AuthorizationError('Only the invitation recipient can accept it');
  }
  
  // Check if request is still pending
  if (request.status !== 'PENDING') {
    throw new ValidationError(`Request has already been ${request.status.toLowerCase()}`);
  }
  
  // Get project
  const project = await getItem(`PROJECT#${request.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Check if user is already a member (edge case)
  if (project.memberIds.includes(userId)) {
    throw new ValidationError('You are already a member of this project');
  }
  
  const timestamp = getCurrentTimestamp();
  
  // Update request status
  await updateItem(
    `REQUEST#${id}`,
    'METADATA',
    'SET #status = :status, #updatedAt = :updatedAt, #GSI2SK = :GSI2SK',
    {
      '#status': 'status',
      '#updatedAt': 'updatedAt',
      '#GSI2SK': 'GSI2SK'
    },
    {
      ':status': 'ACCEPTED',
      ':updatedAt': timestamp,
      ':GSI2SK': 'ACCEPTED'
    }
  );
  
  // Update project-request relationship
  await updateItem(
    `PROJECT#${request.projectId}`,
    `REQUEST#${id}`,
    'SET #status = :status',
    {
      '#status': 'status'
    },
    {
      ':status': 'ACCEPTED'
    }
  );
  
  // Update user-request relationship
  await updateItem(
    `USER#${userId}`,
    `REQUEST#${id}`,
    'SET #status = :status REMOVE #isUnread',
    {
      '#status': 'status',
      '#isUnread': 'isUnread'
    },
    {
      ':status': 'ACCEPTED'
    }
  );
  
  // Add user to project members
  const updatedMemberIds = [...project.memberIds, userId];
  
  await updateItem(
    `PROJECT#${request.projectId}`,
    'METADATA',
    'SET #memberIds = :memberIds, #updatedAt = :updatedAt',
    {
      '#memberIds': 'memberIds',
      '#updatedAt': 'updatedAt'
    },
    {
      ':memberIds': updatedMemberIds,
      ':updatedAt': timestamp
    }
  );
  
  // Create project-member relationship
  const memberItem = {
    PK: `PROJECT#${request.projectId}`,
    SK: `MEMBER#${userId}`,
    EntityType: 'ProjectMember',
    projectId: request.projectId,
    userId,
    joinedAt: timestamp
  };
  
  await putItem(memberItem);
  
  // Create user-project relationship
  const userProjectItem = {
    PK: `USER#${userId}`,
    SK: `PROJECT#${request.projectId}`,
    EntityType: 'UserProject',
    userId,
    projectId: request.projectId,
    joinedAt: timestamp
  };
  
  await putItem(userProjectItem);
  
  // Get updated entities for response
  const sender = await getItem(`USER#${request.senderId}`, 'METADATA');
  const recipient = await getItem(`USER#${userId}`, 'METADATA');
  
  return {
    id,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      imageURL: project.imageURL
    },
    sender: sender ? {
      id: sender.id,
      username: sender.username,
      firstName: sender.firstName,
      lastName: sender.lastName,
      gender: sender.gender,
      imageURL: sender.imageURL
    } : null,
    recipient: recipient ? {
      id: recipient.id,
      username: recipient.username,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      gender: recipient.gender,
      imageURL: recipient.imageURL
    } : null,
    message: request.message,
    status: 'ACCEPTED',
    createdAt: request.createdAt,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(acceptRequest);
