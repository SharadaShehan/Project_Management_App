// List Project Requests Handler
import { queryItems, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler } from '../shared/errors.js';

async function listRequests(event) {
  const { status } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Query user-request relationships
  const userRequests = await queryItems(`USER#${userId}`, 'REQUEST#');
  
  if (!userRequests || userRequests.length === 0) {
    return [];
  }
  
  // Filter by status if provided
  let filteredRequests = userRequests;
  if (status) {
    filteredRequests = userRequests.filter(r => r.status === status);
  }
  
  // Get full request details
  const requestKeys = filteredRequests.map(r => ({
    PK: `REQUEST#${r.requestId}`,
    SK: 'METADATA'
  }));
  
  const requests = await batchGetItems(requestKeys);
  
  // Get unique project IDs
  const projectIds = [...new Set(requests.map(r => r.projectId))];
  
  // Get project details
  const projectKeys = projectIds.map(id => ({
    PK: `PROJECT#${id}`,
    SK: 'METADATA'
  }));
  
  const projects = await batchGetItems(projectKeys);
  const projectMap = new Map(projects.map(p => [p.id, p]));
  
  // Get unique sender IDs
  const senderIds = [...new Set(requests.map(r => r.senderId))];
  
  // Get sender details
  const senderKeys = senderIds.map(id => ({
    PK: `USER#${id}`,
    SK: 'METADATA'
  }));
  
  const senders = await batchGetItems(senderKeys);
  const senderMap = new Map(senders.map(s => [s.id, s]));
  
  // Get recipient details (current user)
  const { getItem } = await import('../shared/dynamodb.js');
  const recipient = await getItem(`USER#${userId}`, 'METADATA');
  
  // Map requests with details
  const requestsWithDetails = requests.map(request => {
    const project = projectMap.get(request.projectId);
    const sender = senderMap.get(request.senderId);
    
    return {
      id: request.id,
      project: project ? {
        id: project.id,
        title: project.title,
        description: project.description,
        imageURL: project.imageURL
      } : null,
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
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  });
  
  // Sort by creation date (most recent first)
  requestsWithDetails.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  
  return requestsWithDetails;
}

export const handler = lambdaHandler(listRequests);
