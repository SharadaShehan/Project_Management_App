// Update Task Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { isValidLength, isValidTaskPriority, isValidISODate, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function updateTask(event) {
  const { id, title, description, assignee, deadline, priority, status, endDate, endTime, timezoneOffset } = event.arguments;
  
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
  
  // Validate fields if provided
  if (title !== undefined && title !== null && !isValidLength(title, 1, 200)) {
    throw new ValidationError('Title must be 1-200 characters');
  }
  
  if (description !== undefined && description !== null && !isValidLength(description, 1, 1000)) {
    throw new ValidationError('Description must be 1-1000 characters');
  }
  
  if (priority !== undefined && !isValidTaskPriority(priority)) {
    throw new ValidationError('Invalid priority. Must be LOW, MEDIUM, HIGH, or URGENT');
  }
  
  if (deadline !== undefined && deadline !== null && !isValidISODate(deadline)) {
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
  
  // If assignee is being changed, verify they are a project member
  if (assignee !== undefined && assignee !== task.assigneeId) {
    if (!project.memberIds.includes(assignee)) {
      throw new ValidationError('New assignee must be a member of the project');
    }
    
    // Verify new assignee exists
    const newAssigneeUser = await getItem(`USER#${assignee}`, 'METADATA');
    if (!newAssigneeUser) {
      throw new NotFoundError('New assignee user');
    }
  }
  
  const timestamp = getCurrentTimestamp();
  
  // Build update expression
  const updates = [];
  const expressionAttributeNames = { '#updatedAt': 'updatedAt' };
  const expressionAttributeValues = { ':updatedAt': timestamp };
  
  // Only update fields that are explicitly provided and not null
  if (title !== undefined && title !== null) {
    updates.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = title;
  }
  
  if (description !== undefined && description !== null) {
    updates.push('#description = :description');
    expressionAttributeNames['#description'] = 'description';
    expressionAttributeValues[':description'] = description;
  }
  
  if (assignee !== undefined) {
    updates.push('#assigneeId = :assigneeId');
    expressionAttributeNames['#assigneeId'] = 'assigneeId';
    expressionAttributeValues[':assigneeId'] = assignee;
  }
  
  if (deadline !== undefined) {
    updates.push('#deadline = :deadline');
    expressionAttributeNames['#deadline'] = 'deadline';
    expressionAttributeValues[':deadline'] = deadline;
  }
  
  if (priority !== undefined && priority !== null) {
    updates.push('#priority = :priority');
    expressionAttributeNames['#priority'] = 'priority';
    expressionAttributeValues[':priority'] = priority;
  }
  
  if (status !== undefined && status !== null) {
    updates.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = status;
  }
  
  if (endDate !== undefined) {
    updates.push('#endDate = :endDate');
    expressionAttributeNames['#endDate'] = 'endDate';
    expressionAttributeValues[':endDate'] = endDate;
  }
  
  if (endTime !== undefined) {
    updates.push('#endTime = :endTime');
    expressionAttributeNames['#endTime'] = 'endTime';
    expressionAttributeValues[':endTime'] = endTime;
  }
  
  if (timezoneOffset !== undefined) {
    updates.push('#timezoneOffset = :timezoneOffset');
    expressionAttributeNames['#timezoneOffset'] = 'timezoneOffset';
    expressionAttributeValues[':timezoneOffset'] = timezoneOffset;
  }
  
  // Update task metadata
  const updatedTask = await updateItem(
    `TASK#${id}`,
    'METADATA',
    `SET ${updates.join(', ')}, #updatedAt = :updatedAt`,
    expressionAttributeNames,
    expressionAttributeValues
  );
  
  // Update phase-task relationship
  const phaseUpdates = [];
  const phaseExpressionAttributeNames = { '#updatedAt': 'updatedAt' };
  const phaseExpressionAttributeValues = { ':updatedAt': timestamp };
  
  // Only update fields that are explicitly provided and not null
  if (title !== undefined && title !== null) {
    phaseUpdates.push('#title = :title');
    phaseExpressionAttributeNames['#title'] = 'title';
    phaseExpressionAttributeValues[':title'] = title;
  }
  if (description !== undefined && description !== null) {
    phaseUpdates.push('#description = :description');
    phaseExpressionAttributeNames['#description'] = 'description';
    phaseExpressionAttributeValues[':description'] = description;
  }
  if (priority !== undefined && priority !== null) {
    phaseUpdates.push('#priority = :priority');
    phaseExpressionAttributeNames['#priority'] = 'priority';
    phaseExpressionAttributeValues[':priority'] = priority;
  }
  if (deadline !== undefined) {
    phaseUpdates.push('#deadline = :deadline');
    phaseExpressionAttributeNames['#deadline'] = 'deadline';
    phaseExpressionAttributeValues[':deadline'] = deadline;
  }
  
  if (assignee !== undefined) {
    const newAssigneeUser = await getItem(`USER#${assignee}`, 'METADATA');
    phaseUpdates.push('#assignee = :assignee');
    phaseExpressionAttributeNames['#assignee'] = 'assignee';
    phaseExpressionAttributeValues[':assignee'] = {
      id: newAssigneeUser.id,
      username: newAssigneeUser.username,
      firstName: newAssigneeUser.firstName,
      lastName: newAssigneeUser.lastName
    };
  }
  
  if (phaseUpdates.length > 0) {
    await updateItem(
      `PHASE#${task.phaseId}`,
      `TASK#${id}`,
      `SET ${phaseUpdates.join(', ')}, #updatedAt = :updatedAt`,
      phaseExpressionAttributeNames,
      phaseExpressionAttributeValues
    );
  }
  
  // If assignee changed, update user-task relationships
  if (assignee !== undefined && assignee !== task.assigneeId) {
    // Delete old user-task relationship
    const { deleteItem } = await import('../shared/dynamodb.js');
    await deleteItem(`USER#${task.assigneeId}`, `TASK#${id}`);
    
    // Create new user-task relationship
    const { putItem } = await import('../shared/dynamodb.js');
    await putItem({
      PK: `USER#${assignee}`,
      SK: `TASK#${id}`,
      EntityType: 'UserTask',
      userId: assignee,
      taskId: id,
      projectId: task.projectId,
      status: task.status,
      createdAt: task.createdAt
    });
  }
  
  // Get full task details for response
  const phase = await getItem(`PHASE#${task.phaseId}`, 'METADATA');
  const assigneeUser = await getItem(`USER#${updatedTask.assigneeId}`, 'METADATA');
  
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

export const handler = lambdaHandler(updateTask);
