// Get Task Handler
import { getItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function getTask(event) {
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
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get phase details
  const phase = await getItem(`PHASE#${task.phaseId}`, 'METADATA');
  
  // Get assignee details
  const assigneeUser = await getItem(`USER#${task.assigneeId}`, 'METADATA');
  
  // Return task with related data
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    phase: phase ? {
      id: phase.id,
      name: phase.name,
      description: phase.description,
      order: phase.order
    } : null,
    assignee: assigneeUser ? {
      id: assigneeUser.id,
      username: assigneeUser.username,
      firstName: assigneeUser.firstName,
      lastName: assigneeUser.lastName,
      gender: assigneeUser.gender,
      imageURL: assigneeUser.imageURL
    } : null,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

export const handler = lambdaHandler(getTask);
