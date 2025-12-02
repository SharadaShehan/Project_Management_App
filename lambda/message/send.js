// Send Message Handler
import { getItem, putItem, queryItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function sendMessage(event) {
  const { projectId, phaseId, receiverId, content } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ content }, ['content']);
  
  if (!isValidLength(content, 1, 2000)) {
    throw new ValidationError('Message content must be 1-2000 characters');
  }
  
  // Determine message type and validate context
  let messageType, contextPK, project, phase, receiver;
  let messageIndex = 1;
  
  if (phaseId) {
    // Phase message
    messageType = 'PHASE';
    phase = await getItem(`PHASE#${phaseId}`, 'METADATA');
    
    if (!phase) {
      throw new NotFoundError('Phase');
    }
    
    // Get project
    project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
    
    if (!project || !project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
    
    // Get message count for index
    const existingMessages = await queryItems(`PHASE#${phaseId}`, 'MESSAGE#');
    messageIndex = existingMessages.length + 1;
    
    contextPK = `PHASE#${phaseId}`;
    
  } else if (receiverId) {
    // Private message
    messageType = 'PRIVATE';
    receiver = await getItem(`USER#${receiverId}`, 'METADATA');
    
    if (!receiver) {
      throw new NotFoundError('Receiver');
    }
    
    if (receiverId === userId) {
      throw new ValidationError('Cannot send a message to yourself');
    }
    
    // Get message count for index (from conversation)
    const conversationId = [userId, receiverId].sort().join('#');
    const existingMessages = await queryItems(`CONVERSATION#${conversationId}`, 'MESSAGE#');
    messageIndex = existingMessages.length + 1;
    
    contextPK = `CONVERSATION#${conversationId}`;
    
  } else if (projectId) {
    // Project message
    messageType = 'PROJECT';
    project = await getItem(`PROJECT#${projectId}`, 'METADATA');
    
    if (!project) {
      throw new NotFoundError('Project');
    }
    
    if (!project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
    
    // Get message count for index
    const existingMessages = await queryItems(`PROJECT#${projectId}`, 'MESSAGE#');
    messageIndex = existingMessages.length + 1;
    
    contextPK = `PROJECT#${projectId}`;
    
  } else {
    throw new ValidationError('Must specify projectId, phaseId, or receiverId');
  }
  
  // Get sender details
  const sender = await getItem(`USER#${userId}`, 'METADATA');
  
  // Generate message ID and timestamp
  const messageId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create message item
  const messageItem = {
    PK: contextPK,
    SK: `MESSAGE#${messageId}`,
    GSI3PK: contextPK,
    GSI3SK: timestamp,
    EntityType: 'Message',
    id: messageId,
    senderId: userId,
    receiverId: receiverId || null,
    content,
    messageType,
    projectId: project ? project.id : null,
    phaseId: phase ? phase.id : null,
    messageIndex,
    readBy: [userId], // Sender has read it
    createdAt: timestamp
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
    contextId: receiverId || phaseId || projectId,
    createdAt: timestamp
  };
  
  await putItem(senderMessageItem);
  
  // For private messages, create recipient index
  if (messageType === 'PRIVATE') {
    const recipientMessageItem = {
      PK: `USER#${receiverId}`,
      SK: `MESSAGE#${messageId}`,
      EntityType: 'UserMessage',
      userId: receiverId,
      messageId,
      messageType,
      contextId: userId,
      isUnread: true,
      createdAt: timestamp
    };
    
    await putItem(recipientMessageItem);
  }
  
  // Return message according to type
  const senderShortened = {
    id: sender.id,
    username: sender.username,
    firstName: sender.firstName,
    lastName: sender.lastName,
    gender: sender.gender,
    imageURL: sender.imageURL
  };
  
  if (messageType === 'PRIVATE') {
    return {
      id: messageId,
      sender: senderShortened,
      receiver: {
        id: receiver.id,
        username: receiver.username,
        firstName: receiver.firstName,
        lastName: receiver.lastName,
        gender: receiver.gender,
        imageURL: receiver.imageURL
      },
      content,
      index: messageIndex,
      createdAt: timestamp,
      read: false // Receiver hasn't read it yet
    };
  } else if (messageType === 'PROJECT') {
    return {
      id: messageId,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status
      },
      sender: senderShortened,
      content,
      index: messageIndex,
      createdAt: timestamp,
      read: null // Not applicable for group messages
    };
  } else if (messageType === 'PHASE') {
    return {
      id: messageId,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status
      },
      phase: {
        id: phase.id,
        name: phase.name,
        description: phase.description,
        order: phase.order
      },
      sender: senderShortened,
      content,
      index: messageIndex,
      createdAt: timestamp,
      read: null // Not applicable for group messages
    };
  }
}

export const handler = lambdaHandler(sendMessage);
