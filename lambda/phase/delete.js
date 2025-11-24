// Delete Phase Handler
import { getItem, deleteItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function deletePhase(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get phase
  const phase = await getItem(`PHASE#${id}`, 'METADATA');
  
  if (!phase) {
    throw new NotFoundError('Phase');
  }
  
  // Get project to verify ownership
  const project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Only project owner can delete phase
  if (project.ownerId !== userId) {
    throw new AuthorizationError('Only the project owner can delete phases');
  }
  
  // Delete phase metadata
  await deleteItem(`PHASE#${id}`, 'METADATA');
  
  // Delete process-phase relationship
  await deleteItem(`PROCESS#${phase.processId}`, `PHASE#${id}`);
  
  // Delete all tasks in this phase
  const tasksResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PHASE#${id}`,
      ':sk': 'TASK#'
    }
  });
  
  for (const task of tasksResult.items) {
    await deleteItem(task.PK, task.SK);
    // Also delete task metadata
    await deleteItem(`TASK#${task.taskId}`, 'METADATA');
  }
  
  return true;
}

export const handler = lambdaHandler(deletePhase);
