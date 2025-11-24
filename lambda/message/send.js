// Send Message Handler
import { getItem, putItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function sendMessage(event) {
  const { projectId, phaseId, recipientId, content } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields - content is always required
  validateRequiredFields({ content }, ['content']);
  
  if (!isValidLength(content, 1, 2000)) {
    throw new ValidationError('Message content must be 1-2000 characters');
  }
  
  // Determine message type and validate context
  let messageType;
  let contextId;
  
  if (phaseId) {
    // Phase-specific message
    messageType = 'PHASE';
    contextId = phaseId;
    
    const phase = await getItem(`PHASE#${phaseId}`, 'METADATA');
    if (!phase) {
      throw new NotFoundError('Phase');
    }
    
    // Verify user is member of the project
    const project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
    if (!project || !project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
  } else if (recipientId) {
    // Private message
    messageType = 'PRIVATE';
    contextId = recipientId;
    
    // Verify recipient exists
    const recipient = await getItem(`USER#${recipientId}`, 'METADATA');
    if (!recipient) {
      throw new NotFoundError('Recipient');
    }
    
    // Can't send message to yourself
    if (recipientId === userId) {
      throw new ValidationError('Cannot send a message to yourself');
    }
  } else if (projectId) {
    // Project-wide message
    messageType = 'PROJECT';
    contextId = projectId;
    
    const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
    if (!project) {
      throw new NotFoundError('Project');
    }
    
    if (!project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
  } else {
    throw new ValidationError('Must specify projectId, phaseId, or recipientId');
  }
  
  // Get sender details
  const sender = await getItem(`USER#${userId}`, 'METADATA');
  
  // Generate message ID
  const messageId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create message item based on type
  let messagePK, messageSK;
  
  if (messageType === 'PROJECT') {
    messagePK = `PROJECT#${projectId}`;
    messageSK = `MESSAGE#${messageId}`;
  } else if (messageType === 'PHASE') {
    messagePK = `PHASE#${phaseId}`;
    messageSK = `MESSAGE#${messageId}`;
  } else if (messageType === 'PRIVATE') {
    // For private messages, create a conversation ID (sorted user IDs)
    const conversationId = [userId, recipientId].sort().join('#');
    messagePK = `CONVERSATION#${conversationId}`;
    messageSK = `MESSAGE#${messageId}`;
  }
  
  const messageItem = {
    PK: messagePK,
    SK: messageSK,
    GSI3PK: messageType === 'PRIVATE' ? messagePK : `${messageType}#${contextId}`,
    GSI3SK: timestamp,
    EntityType: 'Message',
    id: messageId,
    senderId: userId,
    content,
    messageType,
    projectId: messageType === 'PROJECT' ? projectId : undefined,
    phaseId: messageType === 'PHASE' ? phaseId : undefined,
    recipientId: messageType === 'PRIVATE' ? recipientId : undefined,
    conversationId: messageType === 'PRIVATE' ? [userId, recipientId].sort().join('#') : undefined,
    readBy: [userId], // Sender has read it
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(messageItem);
  
  // Create user-message index for sender
  const senderMessageItem = {
    PK: `USER#${userId}`,
    SK: `MESSAGE#${messageId}`,
    EntityType: 'UserMessage',
    userId,
    messageId,
    messageType,
    contextId,
    createdAt: timestamp
  };
  
  await putItem(senderMessageItem);
  
  // For private messages, create recipient index
  if (messageType === 'PRIVATE') {
    const recipientMessageItem = {
      PK: `USER#${recipientId}`,
      SK: `MESSAGE#${messageId}`,
      EntityType: 'UserMessage',
      userId: recipientId,
      messageId,
      messageType,
      contextId: userId, // From sender's perspective
      isUnread: true,
      createdAt: timestamp
    };
    
    await putItem(recipientMessageItem);
  }
  
  // Return message
  return {
    id: messageId,
    sender: {
      id: sender.id,
      username: sender.username,
      firstName: sender.firstName,
      lastName: sender.lastName,
      gender: sender.gender,
      imageURL: sender.imageURL
    },
    content,
    messageType,
    projectId: messageType === 'PROJECT' ? projectId : null,
    phaseId: messageType === 'PHASE' ? phaseId : null,
    recipientId: messageType === 'PRIVATE' ? recipientId : null,
    readBy: [userId],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(sendMessage);
