// Update Task Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { isValidLength, isValidTaskPriority, isValidISODate, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function updateTask(event) {
  const { id, title, description, assignee, deadline, priority } = event.arguments;
  
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
  if (title !== undefined && !isValidLength(title, 1, 200)) {
    throw new ValidationError('Title must be 1-200 characters');
  }
  
  if (description !== undefined && !isValidLength(description, 1, 1000)) {
    throw new ValidationError('Description must be 1-1000 characters');
  }
  
  if (priority !== undefined && !isValidTaskPriority(priority)) {
    throw new ValidationError('Invalid priority. Must be LOW, MEDIUM, HIGH, or URGENT');
  }
  
  if (deadline !== undefined && deadline !== null && !isValidISODate(deadline)) {
    throw new ValidationError('Invalid deadline format. Must be ISO date string');
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
  
  if (title !== undefined) {
    updates.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = title;
  }
  
  if (description !== undefined) {
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
  
  if (priority !== undefined) {
    updates.push('#priority = :priority');
    expressionAttributeNames['#priority'] = 'priority';
    expressionAttributeValues[':priority'] = priority;
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
  if (title !== undefined) phaseUpdates.push('#title = :title');
  if (description !== undefined) phaseUpdates.push('#description = :description');
  if (priority !== undefined) phaseUpdates.push('#priority = :priority');
  if (deadline !== undefined) phaseUpdates.push('#deadline = :deadline');
  
  if (assignee !== undefined) {
    const newAssigneeUser = await getItem(`USER#${assignee}`, 'METADATA');
    phaseUpdates.push('#assignee = :assignee');
    expressionAttributeNames['#assignee'] = 'assignee';
    expressionAttributeValues[':assignee'] = {
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
      expressionAttributeNames,
      expressionAttributeValues
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
