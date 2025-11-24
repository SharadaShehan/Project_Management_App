// List Messages Handler
import { getItem, queryItems, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function listMessages(event) {
  const { projectId, phaseId, recipientId, limit } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  const messageLimit = limit || 50; // Default to 50 messages
  let messages = [];
  let queryPK;
  
  // Determine which messages to fetch
  if (phaseId) {
    // Phase-specific messages
    const phase = await getItem(`PHASE#${phaseId}`, 'METADATA');
    if (!phase) {
      throw new NotFoundError('Phase');
    }
    
    // Verify user is member of the project
    const project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
    if (!project || !project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
    
    queryPK = `PHASE#${phaseId}`;
    messages = await queryItems(queryPK, 'MESSAGE#');
    
  } else if (recipientId) {
    // Private messages between two users
    const recipient = await getItem(`USER#${recipientId}`, 'METADATA');
    if (!recipient) {
      throw new NotFoundError('Recipient');
    }
    
    // Create conversation ID (sorted user IDs)
    const conversationId = [userId, recipientId].sort().join('#');
    queryPK = `CONVERSATION#${conversationId}`;
    messages = await queryItems(queryPK, 'MESSAGE#');
    
  } else if (projectId) {
    // Project-wide messages
    const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
    if (!project) {
      throw new NotFoundError('Project');
    }
    
    if (!project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
    
    queryPK = `PROJECT#${projectId}`;
    messages = await queryItems(queryPK, 'MESSAGE#');
    
  } else {
    throw new ValidationError('Must specify projectId, phaseId, or recipientId');
  }
  
  // Sort by creation time (most recent last for chat display)
  messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  
  // Apply limit (get most recent)
  if (messages.length > messageLimit) {
    messages = messages.slice(-messageLimit);
  }
  
  // Get unique sender IDs
  const senderIds = [...new Set(messages.map(m => m.senderId))];
  
  // Get sender details
  const senderKeys = senderIds.map(id => ({
    PK: `USER#${id}`,
    SK: 'METADATA'
  }));
  
  const senders = await batchGetItems(senderKeys);
  const senderMap = new Map(senders.map(s => [s.id, s]));
  
  // Map messages with sender details
  const messagesWithDetails = messages.map(message => {
    const sender = senderMap.get(message.senderId);
    
    return {
      id: message.id,
      sender: sender ? {
        id: sender.id,
        username: sender.username,
        firstName: sender.firstName,
        lastName: sender.lastName,
        gender: sender.gender,
        imageURL: sender.imageURL
      } : null,
      content: message.content,
      messageType: message.messageType,
      projectId: message.projectId || null,
      phaseId: message.phaseId || null,
      recipientId: message.recipientId || null,
      readBy: message.readBy || [],
      isRead: message.readBy ? message.readBy.includes(userId) : false,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
  });
  
  return messagesWithDetails;
}

export const handler = lambdaHandler(listMessages);
