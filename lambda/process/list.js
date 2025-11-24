// List Processes for Project Handler
import { getItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function listProcesses(event) {
  const { projectId } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Query processes for this project
  const processesResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'PROCESS#'
    }
  });
  
  // Return process summaries
  const processes = processesResult.items.map(p => ({
    id: p.processId,
    name: p.name,
    description: p.description
  }));
  
  // Sort by creation date (oldest first - typical process order)
  processes.sort((a, b) => {
    const aTimestamp = processesResult.items.find(p => p.processId === a.id)?.createdAt || '';
    const bTimestamp = processesResult.items.find(p => p.processId === b.id)?.createdAt || '';
    return new Date(aTimestamp) - new Date(bTimestamp);
  });
  
  return processes;
}

export const handler = lambdaHandler(listProcesses);
