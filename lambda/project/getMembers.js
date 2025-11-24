// Get Project Members Handler
import { getItem, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function getMembers(event) {
  const { projectId } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Check if user is a member
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get all member details
  const memberKeys = project.memberIds.map(id => ({ PK: `USER#${id}`, SK: 'METADATA' }));
  const memberDetails = await batchGetItems(memberKeys);
  
  // Return member summary
  return memberDetails.map(m => ({
    id: m.id,
    username: m.username,
    firstName: m.firstName,
    lastName: m.lastName,
    gender: m.gender,
    imageURL: m.imageURL
  }));
}

export const handler = lambdaHandler(getMembers);
