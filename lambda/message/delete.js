// Delete Message Handler
import { getItem, deleteItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function deleteMessage(event) {
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
  
  // Authorization: Only sender can delete their own messages
  // Or project owner for project/phase messages
  let canDelete = false;
  
  if (message.senderId === userId) {
    // Sender can always delete their own message
    canDelete = true;
  } else if (message.messageType === 'PROJECT' || message.messageType === 'PHASE') {
    // For project/phase messages, check if user is project owner
    const projectIdToCheck = message.messageType === 'PROJECT' 
      ? message.projectId 
      : (await getItem(`PHASE#${message.phaseId}`, 'METADATA')).projectId;
    
    const project = await getItem(`PROJECT#${projectIdToCheck}`, 'METADATA');
    
    if (project && project.ownerId === userId) {
      canDelete = true;
    }
  }
  
  if (!canDelete) {
    throw new AuthorizationError('You can only delete your own messages');
  }
  
  // Delete message
  await deleteItem(messagePK, `MESSAGE#${messageId}`);
  
  // Delete user-message index for sender
  await deleteItem(`USER#${message.senderId}`, `MESSAGE#${messageId}`);
  
  // For private messages, delete recipient index too
  if (message.messageType === 'PRIVATE') {
    await deleteItem(`USER#${message.recipientId}`, `MESSAGE#${messageId}`);
  }
  
  return {
    id: messageId,
    success: true,
    message: 'Message deleted successfully'
  };
}

export const handler = lambdaHandler(deleteMessage);
