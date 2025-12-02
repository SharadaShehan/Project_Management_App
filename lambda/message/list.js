// List Messages Handler
import { getItem, queryItems, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function listMessages(event) {
  const { projectId, phaseId, userId: recipientId, lastMessageIndex, limit } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  const messageLimit = limit || 50;
  const startIndex = lastMessageIndex || 0;
  let messages = [];
  let queryPK, project, phase;
  
  // Determine which messages to fetch
  if (phaseId) {
    // Phase messages
    phase = await getItem(`PHASE#${phaseId}`, 'METADATA');
    if (!phase) {
      throw new NotFoundError('Phase');
    }
    
    // Get project
    project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
    if (!project || !project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
    
    queryPK = `PHASE#${phaseId}`;
    messages = await queryItems(queryPK, 'MESSAGE#');
    
  } else if (recipientId) {
    // Private messages
    const recipient = await getItem(`USER#${recipientId}`, 'METADATA');
    if (!recipient) {
      throw new NotFoundError('Recipient');
    }
    
    // Create conversation ID
    const conversationId = [userId, recipientId].sort().join('#');
    queryPK = `CONVERSATION#${conversationId}`;
    messages = await queryItems(queryPK, 'MESSAGE#');
    
  } else if (projectId) {
    // Project messages
    project = await getItem(`PROJECT#${projectId}`, 'METADATA');
    if (!project) {
      throw new NotFoundError('Project');
    }
    
    if (!project.memberIds.includes(userId)) {
      throw new AuthorizationError('You are not a member of this project');
    }
    
    queryPK = `PROJECT#${projectId}`;
    messages = await queryItems(queryPK, 'MESSAGE#');
    
  } else {
    throw new ValidationError('Must specify projectId, phaseId, or userId');
  }
  
  // Sort by index or creation time
  messages.sort((a, b) => {
    const aIndex = a.messageIndex || 0;
    const bIndex = b.messageIndex || 0;
    return aIndex - bIndex || a.createdAt.localeCompare(b.createdAt);
  });
  
  // Filter by index and apply limit
  messages = messages.filter(m => (m.messageIndex || 0) > startIndex);
  if (messages.length > messageLimit) {
    messages = messages.slice(0, messageLimit);
  }
  
  // Get unique sender and receiver IDs
  const userIds = new Set();
  messages.forEach(m => {
    userIds.add(m.senderId);
    if (m.receiverId) userIds.add(m.receiverId);
  });
  
  // Get user details
  const userKeys = Array.from(userIds).map(id => ({
    PK: `USER#${id}`,
    SK: 'METADATA'
  }));
  
  const users = userKeys.length > 0 ? await batchGetItems(userKeys) : [];
  const userMap = new Map(users.map(u => [u.id, u]));
  
  // Map messages to proper types
  const messagesWithDetails = messages.map(message => {
    const sender = userMap.get(message.senderId);
    const senderShortened = sender ? {
      id: sender.id,
      username: sender.username,
      firstName: sender.firstName,
      lastName: sender.lastName,
      gender: sender.gender,
      imageURL: sender.imageURL
    } : null;
    
    const isRead = message.readBy ? message.readBy.includes(userId) : false;
    
    if (message.messageType === 'PRIVATE' || recipientId) {
      const receiver = userMap.get(message.receiverId || recipientId);
      return {
        id: message.id,
        sender: senderShortened,
        receiver: receiver ? {
          id: receiver.id,
          username: receiver.username,
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          gender: receiver.gender,
          imageURL: receiver.imageURL
        } : null,
        content: message.content,
        index: message.messageIndex || 0,
        createdAt: message.createdAt,
        read: message.senderId === userId ? true : isRead
      };
    } else if (message.messageType === 'PROJECT' || projectId) {
      return {
        id: message.id,
        project: project ? {
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status
        } : null,
        sender: senderShortened,
        content: message.content,
        index: message.messageIndex || 0,
        createdAt: message.createdAt,
        read: null
      };
    } else if (message.messageType === 'PHASE' || phaseId) {
      return {
        id: message.id,
        project: project ? {
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status
        } : null,
        phase: phase ? {
          id: phase.id,
          name: phase.name,
          description: phase.description,
          order: phase.order
        } : null,
        sender: senderShortened,
        content: message.content,
        index: message.messageIndex || 0,
        createdAt: message.createdAt,
        read: null
      };
    }
  });
  
  return messagesWithDetails.filter(m => m !== undefined);
}

export const handler = lambdaHandler(listMessages);
