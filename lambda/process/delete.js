// Delete Process Handler
import { getItem, deleteItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function deleteProcess(event) {
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
  
  // Only project owner can delete process
  if (project.ownerId !== userId) {
    throw new AuthorizationError('Only the project owner can delete processes');
  }
  
  // Delete process metadata
  await deleteItem(`PROCESS#${id}`, 'METADATA');
  
  // Delete project-process relationship
  await deleteItem(`PROJECT#${process.projectId}`, `PROCESS#${id}`);
  
  // Delete all phases in this process
  const phasesResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROCESS#${id}`,
      ':sk': 'PHASE#'
    }
  });
  
  for (const phase of phasesResult.items) {
    await deleteItem(phase.PK, phase.SK);
    // Also delete phase metadata
    await deleteItem(`PHASE#${phase.phaseId}`, 'METADATA');
  }
  
  // Note: In production, cascade delete tasks as well
  
  return true;
}

export const handler = lambdaHandler(deleteProcess);
