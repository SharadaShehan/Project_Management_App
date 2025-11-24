// Create Task Handler
import { getItem, putItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, isValidTaskPriority, isValidISODate, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createTask(event) {
  const { phaseId, title, description, assignee, deadline, priority } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ phaseId, title, description, assignee }, ['phaseId', 'title', 'description', 'assignee']);
  
  if (!isValidLength(title, 1, 200)) {
    throw new ValidationError('Title must be 1-200 characters');
  }
  
  if (!isValidLength(description, 1, 1000)) {
    throw new ValidationError('Description must be 1-1000 characters');
  }
  
  if (priority && !isValidTaskPriority(priority)) {
    throw new ValidationError('Invalid priority. Must be LOW, MEDIUM, HIGH, or URGENT');
  }
  
  if (deadline && !isValidISODate(deadline)) {
    throw new ValidationError('Invalid deadline format. Must be ISO date string');
  }
  
  // Get phase and verify access
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
  
  // Verify assignee is a project member
  if (!project.memberIds.includes(assignee)) {
    throw new ValidationError('Assignee must be a member of the project');
  }
  
  // Get assignee details
  const assigneeUser = await getItem(`USER#${assignee}`, 'METADATA');
  
  if (!assigneeUser) {
    throw new NotFoundError('Assignee user');
  }
  
  // Generate task ID
  const taskId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create task item
  const taskItem = {
    PK: `TASK#${taskId}`,
    SK: 'METADATA',
    GSI2PK: 'TASK',
    GSI2SK: 'TODO', // Status for filtering
    GSI3PK: 'TASK',
    GSI3SK: timestamp,
    EntityType: 'Task',
    id: taskId,
    phaseId,
    processId: phase.processId,
    projectId: phase.projectId,
    title,
    description,
    assigneeId: assignee,
    status: 'TODO',
    priority: priority || 'MEDIUM',
    deadline: deadline || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(taskItem);
  
  // Create phase-task relationship
  const phaseTaskItem = {
    PK: `PHASE#${phaseId}`,
    SK: `TASK#${taskId}`,
    EntityType: 'PhaseTask',
    phaseId,
    taskId,
    title,
    description,
    status: 'TODO',
    priority: priority || 'MEDIUM',
    assignee: {
      id: assigneeUser.id,
      username: assigneeUser.username,
      firstName: assigneeUser.firstName,
      lastName: assigneeUser.lastName
    },
    deadline: deadline || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(phaseTaskItem);
  
  // Create user-task relationship (for assignee queries)
  const userTaskItem = {
    PK: `USER#${assignee}`,
    SK: `TASK#${taskId}`,
    EntityType: 'UserTask',
    userId: assignee,
    taskId,
    projectId: phase.projectId,
    status: 'TODO',
    createdAt: timestamp
  };
  
  await putItem(userTaskItem);
  
  // Return task
  return {
    id: taskId,
    title,
    description,
    phase: {
      id: phase.id,
      name: phase.name,
      description: phase.description,
      order: phase.order
    },
    assignee: {
      id: assigneeUser.id,
      username: assigneeUser.username,
      firstName: assigneeUser.firstName,
      lastName: assigneeUser.lastName,
      gender: assigneeUser.gender,
      imageURL: assigneeUser.imageURL
    },
    status: 'TODO',
    priority: priority || 'MEDIUM',
    deadline,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(createTask);
