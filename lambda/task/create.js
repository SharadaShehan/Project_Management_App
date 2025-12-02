// Create Task Handler
import { getItem, putItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, isValidTaskPriority, isValidISODate, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createTask(event) {
  const { phaseId, title, description, assignee, deadline, priority, endDate, endTime, timezoneOffset } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields (assignee is now optional)
  validateRequiredFields({ phaseId, title, description }, ['phaseId', 'title', 'description']);
  
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
  
  // Validate date fields if provided
  if (endDate !== undefined && endDate !== null) {
    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      throw new ValidationError('Invalid end date format');
    }
  }
  
  if (endTime !== undefined && endTime !== null) {
    if (typeof endTime !== 'string' || !/^\d{2}:\d{2}$/.test(endTime)) {
      throw new ValidationError('End time must be in HH:MM format');
    }
  }
  
  if (timezoneOffset !== undefined && timezoneOffset !== null) {
    if (typeof timezoneOffset !== 'number' || timezoneOffset < -720 || timezoneOffset > 840) {
      throw new ValidationError('Timezone offset must be a number between -720 and 840 minutes');
    }
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
  
  // Verify assignee is a project member (if provided)
  let assigneeUser = null;
  if (assignee) {
    if (!project.memberIds.includes(assignee)) {
      throw new ValidationError('Assignee must be a member of the project');
    }
    
    // Get assignee details
    assigneeUser = await getItem(`USER#${assignee}`, 'METADATA');
    
    if (!assigneeUser) {
      throw new NotFoundError('Assignee user');
    }
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
    taskId,
    phaseId,
    processId: phase.processId,
    projectId: phase.projectId,
    title,
    description,
    assigneeId: assignee || null,
    status: 'TODO',
    priority: priority || 'MEDIUM',
    deadline: deadline || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Add optional date/time fields if provided
  if (endDate !== undefined && endDate !== null) {
    taskItem.endDate = endDate;
  }
  if (endTime !== undefined && endTime !== null) {
    taskItem.endTime = endTime;
  }
  if (timezoneOffset !== undefined && timezoneOffset !== null) {
    taskItem.timezoneOffset = timezoneOffset;
  }
  
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
    assignee: assigneeUser ? {
      id: assigneeUser.id,
      username: assigneeUser.username,
      firstName: assigneeUser.firstName,
      lastName: assigneeUser.lastName
    } : null,
    deadline: deadline || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Add optional date/time fields if provided
  if (endDate !== undefined && endDate !== null) {
    phaseTaskItem.endDate = endDate;
  }
  if (endTime !== undefined && endTime !== null) {
    phaseTaskItem.endTime = endTime;
  }
  if (timezoneOffset !== undefined && timezoneOffset !== null) {
    phaseTaskItem.timezoneOffset = timezoneOffset;
  }
  
  await putItem(phaseTaskItem);
  
  // Create user-task relationship (for assignee queries) only if assignee is provided
  if (assignee) {
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
  }
  
  // Return task
  console.log('Phase data:', JSON.stringify(phase));
  console.log('Assignee user data:', assigneeUser ? JSON.stringify(assigneeUser) : 'No assignee');
  
  const result = {
    id: taskId,
    title,
    description,
    phase: {
      id: phaseId,
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
    taskAssignees: assigneeUser ? [{
      id: assigneeUser.id,
      username: assigneeUser.username,
      firstName: assigneeUser.firstName,
      lastName: assigneeUser.lastName,
      imageURL: assigneeUser.imageURL
    }] : [],
    status: 'TODO',
    priority: priority || 'MEDIUM',
    deadline: deadline || null,
    endDate: endDate || null,
    endTime: endTime || null,
    timezoneOffset: timezoneOffset || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  console.log('Returning result:', JSON.stringify(result));
  return result;
}

export const handler = lambdaHandler(createTask);
