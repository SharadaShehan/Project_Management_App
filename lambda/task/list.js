// List Tasks for Phase Handler
import { getItem, queryItems, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function listTasks(event) {
  const { phaseId, status, assignee } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get phase
  const phase = await getItem(`PHASE#${phaseId}`, 'METADATA');
  
  if (!phase) {
    throw new NotFoundError('Phase');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Query phase-task relationships
  const phaseTasks = await queryItems(`PHASE#${phaseId}`, 'TASK#');
  
  if (!phaseTasks || phaseTasks.length === 0) {
    return [];
  }
  
  // Apply filters
  let filteredTasks = phaseTasks;
  
  if (status) {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }
  
  if (assignee) {
    filteredTasks = filteredTasks.filter(t => t.assignee && t.assignee.id === assignee);
  }
  
  // Get full task details
  const taskKeys = filteredTasks.map(t => ({
    PK: `TASK#${t.taskId}`,
    SK: 'METADATA'
  }));
  
  const tasks = await batchGetItems(taskKeys);
  
  // Get unique assignee IDs
  const assigneeIds = [...new Set(tasks.map(t => t.assigneeId))];
  
  // Get assignee details
  const assigneeKeys = assigneeIds.map(id => ({
    PK: `USER#${id}`,
    SK: 'METADATA'
  }));
  
  const assignees = await batchGetItems(assigneeKeys);
  const assigneeMap = new Map(assignees.map(a => [a.id, a]));
  
  // Map tasks with assignee details
  const tasksWithDetails = tasks.map(task => {
    const assigneeUser = assigneeMap.get(task.assigneeId);
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      phase: {
        id: phase.id,
        name: phase.name,
        description: phase.description,
        order: phase.order
      },
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
  });
  
  // Sort by priority (URGENT > HIGH > MEDIUM > LOW), then by creation date
  const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  
  tasksWithDetails.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt.localeCompare(b.createdAt);
  });
  
  return tasksWithDetails;
}

export const handler = lambdaHandler(listTasks);
