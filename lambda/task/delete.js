// Delete Task Handler
import { getItem, deleteItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function deleteTask(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get task
  const task = await getItem(`TASK#${id}`, 'METADATA');
  
  if (!task) {
    throw new NotFoundError('Task');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${task.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Only project owner, task assignee, or project members can delete tasks
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Delete task metadata
  await deleteItem(`TASK#${id}`, 'METADATA');
  
  // Delete phase-task relationship
  await deleteItem(`PHASE#${task.phaseId}`, `TASK#${id}`);
  
  // Delete user-task relationship only if assignee exists
  if (task.assigneeId) {
    await deleteItem(`USER#${task.assigneeId}`, `TASK#${id}`);
  }
  
  return true;
}

export const handler = lambdaHandler(deleteTask);
