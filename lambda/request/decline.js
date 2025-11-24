// Decline Project Request Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function declineRequest(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get request
  const request = await getItem(`REQUEST#${id}`, 'METADATA');
  
  if (!request) {
    throw new NotFoundError('Request');
  }
  
  // Only the recipient can decline the request
  if (request.recipientId !== userId) {
    throw new AuthorizationError('Only the invitation recipient can decline it');
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
      ':status': 'DECLINED',
      ':updatedAt': timestamp,
      ':GSI2SK': 'DECLINED'
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
      ':status': 'DECLINED'
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
      ':status': 'DECLINED'
    }
  );
  
  // Get entities for response
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
    status: 'DECLINED',
    createdAt: request.createdAt,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(declineRequest);
