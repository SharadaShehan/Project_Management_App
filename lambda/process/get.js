// Get Process Handler
import { getItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function getProcess(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get process
  const process = await getItem(`PROCESS#${id}`, 'METADATA');
  
  if (!process) {
    throw new NotFoundError('Process');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${process.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get phases for this process
  const phasesResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROCESS#${id}`,
      ':sk': 'PHASE#'
    }
  });
  
  // Sort phases by order
  const phases = phasesResult.items
    .map(p => ({
      id: p.phaseId,
      name: p.name,
      description: p.description,
      order: p.order
    }))
    .sort((a, b) => a.order - b.order);
  
  return {
    id: process.id,
    name: process.name,
    description: process.description,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      logo: project.logo
    },
    phases,
    createdAt: process.createdAt
  };
}

export const handler = lambdaHandler(getProcess);
