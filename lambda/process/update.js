// Update Process Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';
import { isValidLength, getCurrentTimestamp } from '../shared/validation.js';

async function updateProcess(event) {
  const { id, name, description } = event.arguments;
  
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
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Build updates
  const updates = {
    updatedAt: getCurrentTimestamp()
  };
  
  if (name !== undefined) {
    if (!isValidLength(name, 1, 100)) {
      throw new ValidationError('Name must be 1-100 characters');
    }
    updates.name = name;
  }
  
  if (description !== undefined) {
    if (!isValidLength(description, 1, 500)) {
      throw new ValidationError('Description must be 1-500 characters');
    }
    updates.description = description;
  }
  
  // Update process
  const updatedProcess = await updateItem(`PROCESS#${id}`, 'METADATA', updates);
  
  // Also update the project-process relationship if name or description changed
  if (name !== undefined || description !== undefined) {
    const relationshipUpdates = {};
    if (name !== undefined) relationshipUpdates.name = name;
    if (description !== undefined) relationshipUpdates.description = description;
    
    await updateItem(`PROJECT#${process.projectId}`, `PROCESS#${id}`, relationshipUpdates);
  }
  
  return {
    id: updatedProcess.id,
    name: updatedProcess.name,
    description: updatedProcess.description,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      logo: project.logo
    },
    createdAt: updatedProcess.createdAt
  };
}

export const handler = lambdaHandler(updateProcess);
