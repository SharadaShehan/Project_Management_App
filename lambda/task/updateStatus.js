// Update Task Status Handler
import { getItem, updateItem, queryItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { isValidTaskStatus, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

// Valid status transitions
const STATUS_TRANSITIONS = {
  'TODO': ['IN_PROGRESS', 'BLOCKED'],
  'IN_PROGRESS': ['REVIEW', 'BLOCKED', 'TODO'],
  'REVIEW': ['DONE', 'IN_PROGRESS'],
  'BLOCKED': ['TODO', 'IN_PROGRESS'],
  'DONE': ['IN_PROGRESS'] // Allow reopening tasks
};

async function updateTaskStatus(event) {
  const { id, status } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate status
  if (!isValidTaskStatus(status)) {
    throw new ValidationError('Invalid status. Must be TODO, IN_PROGRESS, REVIEW, BLOCKED, or DONE');
  }
  
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
  
  // Check if status transition is valid
  const currentStatus = task.status;
  if (currentStatus === status) {
    throw new ValidationError(`Task is already in ${status} status`);
  }
  
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(status)) {
    throw new ValidationError(
      `Cannot transition from ${currentStatus} to ${status}. ` +
      `Valid transitions: ${allowedTransitions.join(', ') || 'none'}`
    );
  }
  
  const timestamp = getCurrentTimestamp();
  
  // Update task metadata with new status and GSI2SK for status-based queries
  const updatedTask = await updateItem(
    `TASK#${id}`,
    'METADATA',
    'SET #status = :status, #updatedAt = :updatedAt, #GSI2SK = :GSI2SK',
    {
      '#status': 'status',
      '#updatedAt': 'updatedAt',
      '#GSI2SK': 'GSI2SK'
    },
    {
      ':status': status,
      ':updatedAt': timestamp,
      ':GSI2SK': status
    }
  );
  
  // Update phase-task relationship
  await updateItem(
    `PHASE#${task.phaseId}`,
    `TASK#${id}`,
    'SET #status = :status, #updatedAt = :updatedAt',
    {
      '#status': 'status',
      '#updatedAt': 'updatedAt'
    },
    {
      ':status': status,
      ':updatedAt': timestamp
    }
  );
  
  // Update user-task relationship
  await updateItem(
    `USER#${task.assigneeId}`,
    `TASK#${id}`,
    'SET #status = :status',
    {
      '#status': 'status'
    },
    {
      ':status': status
    }
  );
  
  // If task is marked as DONE, check if all tasks in phase are done
  // This could trigger phase completion logic in production
  if (status === 'DONE') {
    const phaseTasks = await queryItems(`PHASE#${task.phaseId}`, 'TASK#');
    const allTasksDone = phaseTasks.every(t => t.taskId === id || t.status === 'DONE');
    
    // Log for monitoring (in production, might trigger notifications or phase status update)
    if (allTasksDone) {
      console.log(`All tasks in phase ${task.phaseId} are now complete`);
    }
  }
  
  // Get full task details for response
  const phase = await getItem(`PHASE#${task.phaseId}`, 'METADATA');
  const assigneeUser = await getItem(`USER#${task.assigneeId}`, 'METADATA');
  
  return {
    id: updatedTask.id,
    title: updatedTask.title,
    description: updatedTask.description,
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
    status: updatedTask.status,
    priority: updatedTask.priority,
    deadline: updatedTask.deadline,
    createdAt: updatedTask.createdAt,
    updatedAt: updatedTask.updatedAt
  };
}

export const handler = lambdaHandler(updateTaskStatus);
