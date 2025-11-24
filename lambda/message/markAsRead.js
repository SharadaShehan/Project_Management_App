// Mark Message as Read Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function markAsRead(event) {
  const { messageId, projectId, phaseId, recipientId } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Determine message location based on context
  let messagePK;
  
  if (phaseId) {
    messagePK = `PHASE#${phaseId}`;
  } else if (recipientId) {
    // For private messages, need to construct conversation ID
    const conversationId = [userId, recipientId].sort().join('#');
    messagePK = `CONVERSATION#${conversationId}`;
  } else if (projectId) {
    messagePK = `PROJECT#${projectId}`;
  } else {
    throw new Error('Must specify projectId, phaseId, or recipientId');
  }
  
  // Get message
  const message = await getItem(messagePK, `MESSAGE#${messageId}`);
  
  if (!message) {
    throw new NotFoundError('Message');
  }
  
  // Verify authorization based on message type
  if (message.messageType === 'PRIVATE') {
    // For private messages, only sender and recipient can mark as read
    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new AuthorizationError('You are not part of this conversation');
    }
  } else if (message.messageType === 'PHASE') {
    // Verify user is member of the project
    const phase = await getItem(`PHASE#${message.phaseId}`, 'METADATA');
    const project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
    
    if (!project || !project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
  } else if (message.messageType === 'PROJECT') {
    // Verify user is member of the project
    const project = await getItem(`PROJECT#${message.projectId}`, 'METADATA');
    
    if (!project || !project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
  }
  
  // Check if user has already read the message
  const readBy = message.readBy || [];
  
  if (readBy.includes(userId)) {
    // Already read, no update needed
    return {
      id: messageId,
      success: true,
      message: 'Message already marked as read'
    };
  }
  
  // Add user to readBy list
  const timestamp = getCurrentTimestamp();
  
  await updateItem(
    messagePK,
    `MESSAGE#${messageId}`,
    'SET #readBy = list_append(if_not_exists(#readBy, :emptyList), :userId), #updatedAt = :updatedAt',
    {
      '#readBy': 'readBy',
      '#updatedAt': 'updatedAt'
    },
    {
      ':userId': [userId],
      ':emptyList': [],
      ':updatedAt': timestamp
    }
  );
  
  // Update user-message index to mark as read
  const userMessage = await getItem(`USER#${userId}`, `MESSAGE#${messageId}`);
  if (userMessage && userMessage.isUnread) {
    await updateItem(
      `USER#${userId}`,
      `MESSAGE#${messageId}`,
      'REMOVE #isUnread',
      {
        '#isUnread': 'isUnread'
      },
      {}
    );
  }
  
  return {
    id: messageId,
    success: true,
    message: 'Message marked as read'
  };
}

export const handler = lambdaHandler(markAsRead);
