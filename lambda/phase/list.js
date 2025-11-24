// List Phases for Process Handler
import { getItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function listPhases(event) {
  const { processId } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get process
  const process = await getItem(`PROCESS#${processId}`, 'METADATA');
  
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
  
  // Query phases for this process
  const phasesResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROCESS#${processId}`,
      ':sk': 'PHASE#'
    }
  });
  
  // Return phase summaries sorted by order
  const phases = phasesResult.items
    .map(p => ({
      id: p.phaseId,
      name: p.name,
      description: p.description,
      order: p.order
    }))
    .sort((a, b) => a.order - b.order);
  
  return phases;
}

export const handler = lambdaHandler(listPhases);
